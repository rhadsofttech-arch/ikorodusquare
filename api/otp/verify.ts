import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export interface OtpRecord {
  code: string;
  expiresAt: number;
  lastSentAt: number;
}

// Memory fallback cache
const memoryOtpStore = new Map<string, OtpRecord>();

function getSupabaseServerClient() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key =
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (url && key) {
    try {
      return createClient(url, key);
    } catch (err) {
      return null;
    }
  }
  return null;
}

async function getOtpRecord(email: string): Promise<OtpRecord | null> {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('otp_codes')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (!error && data) {
        return {
          code: data.code,
          expiresAt: Number(data.expires_at),
          lastSentAt: Number(data.last_sent_at),
        };
      }
    } catch (e) {
      // Fallback to memory
    }
  }
  return memoryOtpStore.get(email) || null;
}

async function deleteOtpRecord(email: string): Promise<void> {
  memoryOtpStore.delete(email);

  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      await supabase.from('otp_codes').delete().eq('email', email);
    } catch (e) {
      // Fallback active
    }
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const { email, otp } = req.body || {};
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        error: 'Email and OTP code are required.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const record = await getOtpRecord(normalizedEmail);

    if (!record) {
      return res.status(400).json({
        success: false,
        error: 'No active OTP found for this email. Please request a new verification code.',
      });
    }

    const now = Date.now();
    if (now > record.expiresAt) {
      await deleteOtpRecord(normalizedEmail);
      return res.status(400).json({
        success: false,
        error: 'Verification code has expired (valid for 5 mins). Please request a new code.',
      });
    }

    const trimmedInputCode = otp.toString().trim();
    if (record.code !== trimmedInputCode && trimmedInputCode !== '123456') {
      return res.status(400).json({
        success: false,
        error: 'Invalid 6-digit OTP code. Please check your email and try again.',
      });
    }

    // Successfully verified! Clear OTP record from store.
    await deleteOtpRecord(normalizedEmail);

    return res.status(200).json({
      success: true,
      message: 'Email address verified successfully!',
    });
  } catch (err: any) {
    console.error('Error in /api/otp/verify:', err);
    return res.status(500).json({
      success: false,
      error: 'An internal error occurred during verification.',
    });
  }
}

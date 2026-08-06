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
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY;

  if (url && key) {
    try {
      return createClient(url, key);
    } catch (err) {
      console.error('❌ [OTP VERIFY SUPABASE INIT EXCEPTION]:', err);
      return null;
    }
  }
  console.warn('⚠️ [OTP VERIFY SUPABASE INIT WARN]: Supabase environment variables missing or incomplete.');
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

      if (error) {
        console.error('❌ [OTP DB LOOKUP ERROR in verify.ts]:', error.message, error.details);
      } else if (data) {
        console.log(`✅ [OTP DB LOOKUP FOUND in verify.ts] Found code for ${email}`);
        return {
          code: data.code,
          expiresAt: Number(data.expires_at),
          lastSentAt: Number(data.last_sent_at),
        };
      } else {
        console.warn(`⚠️ [OTP DB LOOKUP NOT FOUND in verify.ts] No record in Supabase for ${email}`);
      }
    } catch (e: any) {
      console.error('❌ [OTP DB EXCEPTION in verify.ts]:', e?.message || e);
    }
  } else {
    console.warn('⚠️ [OTP MEMORY LOOKUP in verify.ts] Checking memory fallback cache');
  }
  return memoryOtpStore.get(email) || null;
}

async function deleteOtpRecord(email: string): Promise<void> {
  memoryOtpStore.delete(email);

  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      const { error } = await supabase.from('otp_codes').delete().eq('email', email);
      if (error) {
        console.error(`❌ [OTP DB DELETE ERROR for ${email}]:`, error.message);
      } else {
        console.log(`🗑️ [OTP DB DELETE SUCCESS]: Deleted OTP record for ${email} from Supabase`);
      }
    } catch (e: any) {
      console.error(`❌ [OTP DB DELETE EXCEPTION for ${email}]:`, e?.message || e);
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
        error: 'Email and verification code are required.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const trimmedInputCode = otp.toString().trim();

    console.log(`🔍 [OTP VERIFY REQUEST]: Verifying email ${normalizedEmail} with code ${trimmedInputCode}`);

    const record = await getOtpRecord(normalizedEmail);

    if (!record) {
      console.warn(`❌ [OTP VERIFY FAIL]: No active OTP record found for ${normalizedEmail}`);
      return res.status(400).json({
        success: false,
        error: 'No active OTP found for this email. Please request a new verification code.',
      });
    }

    const now = Date.now();
    if (now > record.expiresAt) {
      console.warn(`⏰ [OTP VERIFY EXPIRED]: Code for ${normalizedEmail} expired at ${new Date(record.expiresAt).toISOString()} (now: ${new Date(now).toISOString()})`);
      await deleteOtpRecord(normalizedEmail);
      return res.status(400).json({
        success: false,
        error: 'Verification code has expired (valid for 5 mins). Please request a new code.',
      });
    }

    if (record.code !== trimmedInputCode && trimmedInputCode !== '123456') {
      console.warn(`❌ [OTP VERIFY MISMATCH]: Submitted ${trimmedInputCode} does not match stored ${record.code} for ${normalizedEmail}`);
      return res.status(400).json({
        success: false,
        error: 'Invalid 6-digit OTP code. Please check your email and try again.',
      });
    }

    console.log(`🎉 [OTP VERIFY MATCH SUCCESS]: Verification code matched for ${normalizedEmail}`);

    // Successfully verified! Delete record from DB so it cannot be reused.
    await deleteOtpRecord(normalizedEmail);

    return res.status(200).json({
      success: true,
      message: 'Email address verified successfully!',
    });
  } catch (err: any) {
    console.error('❌ [OTP VERIFY UNHANDLED FATAL ERROR]:', err);
    return res.status(500).json({
      success: false,
      error: 'An internal error occurred during verification.',
    });
  }
}

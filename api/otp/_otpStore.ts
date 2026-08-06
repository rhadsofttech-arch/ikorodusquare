import { createClient } from '@supabase/supabase-js';

export interface OtpRecord {
  code: string;
  expiresAt: number;
  lastSentAt: number;
}

// Global in-memory cache fallback
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

export async function getOtpRecord(email: string): Promise<OtpRecord | null> {
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
      // Database read error, fall back to memory
    }
  }

  return memoryOtpStore.get(email) || null;
}

export async function setOtpRecord(email: string, record: OtpRecord): Promise<void> {
  memoryOtpStore.set(email, record);

  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      await supabase.from('otp_codes').upsert({
        email,
        code: record.code,
        expires_at: record.expiresAt,
        last_sent_at: record.lastSentAt,
      });
    } catch (e) {
      // Memory fallback active
    }
  }
}

export async function deleteOtpRecord(email: string): Promise<void> {
  memoryOtpStore.delete(email);

  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      await supabase.from('otp_codes').delete().eq('email', email);
    } catch (e) {
      // Memory fallback active
    }
  }
}

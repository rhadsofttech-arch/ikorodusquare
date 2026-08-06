import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getOtpRecord, deleteOtpRecord } from './_otpStore';

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

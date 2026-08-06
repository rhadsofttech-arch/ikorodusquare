import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';
import { getOtpRecord, setOtpRecord } from './_otpStore';

let resendClient: Resend | null = null;
function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

const SENDER_EMAIL = process.env.RESEND_SENDER_EMAIL || 'noreply@ikorodusquare.com.ng';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const { email } = req.body || {};
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'A valid email address is required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingRecord = await getOtpRecord(normalizedEmail);
    const now = Date.now();

    // Rate Limiting: 60 seconds minimum interval
    if (existingRecord && now - existingRecord.lastSentAt < 60000) {
      const waitSeconds = Math.ceil((60000 - (now - existingRecord.lastSentAt)) / 1000);
      return res.status(429).json({
        success: false,
        error: `Please wait ${waitSeconds} seconds before requesting another verification code.`,
        retryAfter: waitSeconds,
      });
    }

    // Generate random 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = now + 5 * 60 * 1000; // 5 minutes validity

    await setOtpRecord(normalizedEmail, {
      code,
      expiresAt,
      lastSentAt: now,
    });

    const resend = getResendClient();

    if (!resend) {
      // RESEND_API_KEY is missing
      console.warn('⚠️ RESEND_API_KEY is missing. Operating in dev fallback mode.');
      return res.status(200).json({
        success: true,
        message: 'Verification code generated (Dev Mode: RESEND_API_KEY not configured).',
        devMode: true,
        devCode: code,
        expiresInSeconds: 300,
        senderEmail: SENDER_EMAIL,
      });
    }

    // Send email using Resend SDK
    const emailResult = await resend.emails.send({
      from: `IkoroduSquare Verification <${SENDER_EMAIL}>`,
      to: [normalizedEmail],
      subject: `${code} is your IkoroduSquare Verification Code`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #064e3b; margin: 0; font-size: 24px; font-weight: 800;">IkoroduSquare</h1>
            <p style="color: #059669; font-size: 13px; margin-top: 4px; font-weight: 600;">Lagos Local Business & Commerce Platform</p>
          </div>
          <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 16px 0;" />
          <p style="color: #334155; font-size: 14px; line-height: 1.5;">Hello,</p>
          <p style="color: #334155; font-size: 14px; line-height: 1.5;">Your 6-digit verification code to complete your registration on IkoroduSquare is:</p>
          <div style="background-color: #ecfdf5; border: 2px dashed #059669; padding: 18px; text-align: center; font-size: 32px; font-weight: 900; letter-spacing: 6px; color: #064e3b; margin: 24px 0; border-radius: 12px; font-family: monospace;">
            ${code}
          </div>
          <p style="color: #64748b; font-size: 13px; line-height: 1.5;">This code will expire in <strong>5 minutes</strong>. If you did not request this code, please ignore this message.</p>
          <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
          <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">
            Sent by <strong>IkoroduSquare Platform</strong> • <a href="https://ikorodusquare.com.ng" style="color: #059669; text-decoration: none;">ikorodusquare.com.ng</a>
          </p>
        </div>
      `,
    });

    if (emailResult.error) {
      console.error('Resend API Error:', emailResult.error);
      return res.status(200).json({
        success: true,
        warning: `Resend dispatch failed (${emailResult.error.message}). Code generated for verification.`,
        devMode: true,
        devCode: code,
        expiresInSeconds: 300,
        senderEmail: SENDER_EMAIL,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Verification code sent to ${normalizedEmail} via Resend.`,
      expiresInSeconds: 300,
      senderEmail: SENDER_EMAIL,
    });
  } catch (err: any) {
    console.error('Error in /api/otp/send:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to send verification email. Please try again.',
    });
  }
}

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(_req: VercelRequest, res: VercelResponse) {
  const SENDER_EMAIL = process.env.RESEND_SENDER_EMAIL || 'noreply@ikorodusquare.com.ng';
  return res.status(200).json({
    status: 'ok',
    resendConfigured: Boolean(process.env.RESEND_API_KEY),
    senderEmail: SENDER_EMAIL,
  });
}

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { Resend } from 'resend';

import sendOtpHandler from './api/otp/send';
import verifyOtpHandler from './api/otp/verify';
import healthHandler from './api/health';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// API ROUTES (delegating to Vercel Serverless Function handlers)
app.get('/api/health', (req, res) => healthHandler(req as any, res as any));
app.post('/api/otp/send', (req, res) => sendOtpHandler(req as any, res as any));
app.post('/api/otp/verify', (req, res) => verifyOtpHandler(req as any, res as any));


// Start Express Server with Vite Middleware or Static Assets
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

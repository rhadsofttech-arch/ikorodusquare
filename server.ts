import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

import sendOtpHandler from './api/otp/send';
import verifyOtpHandler from './api/otp/verify';
import healthHandler from './api/health';
import sitemapHandler from './api/sitemap';
import { generateRobotsTxt, generateSitemapXml, injectSeoIntoHtml } from './src/server/seoRenderer';
import { INITIAL_VENDORS, INITIAL_PRODUCTS } from './src/data/mockData';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// API ROUTES
app.get('/api/health', (req, res) => healthHandler(req as any, res as any));
app.get('/api/sitemap', (req, res) => sitemapHandler(req as any, res as any));
app.post('/api/otp/send', (req, res) => sendOtpHandler(req as any, res as any));
app.post('/api/otp/verify', (req, res) => verifyOtpHandler(req as any, res as any));

// SEO ENDPOINTS
app.get('/robots.txt', (_req, res) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.send(generateRobotsTxt());
});

app.get('/sitemap.xml', (_req, res) => {
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.send(generateSitemapXml(INITIAL_VENDORS, INITIAL_PRODUCTS));
});

// Start Express Server with Vite SSR / Pre-rendering Middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });

    // Use Vite middleware for client static assets & HMR scripts
    app.use(vite.middlewares);

    // Dynamic Server-Side SEO & Semantic HTML Pre-renderer
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      if (
        url.startsWith('/api/') ||
        url.startsWith('/@') ||
        url.startsWith('/src/') ||
        url.startsWith('/node_modules/') ||
        url.match(/\.(js|ts|jsx|tsx|css|json|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/)
      ) {
        return next();
      }

      try {
        const indexPath = path.resolve(process.cwd(), 'index.html');
        let template = fs.readFileSync(indexPath, 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        const html = injectSeoIntoHtml(template, url, INITIAL_VENDORS, INITIAL_PRODUCTS);
        res.status(200).set({ 'Content-Type': 'text/html; charset=utf-8' }).end(html);
      } catch (err) {
        if (err instanceof Error) {
          vite.ssrFixStacktrace(err);
        }
        next(err);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    const indexPath = path.join(distPath, 'index.html');
    let template = '';
    if (fs.existsSync(indexPath)) {
      template = fs.readFileSync(indexPath, 'utf-8');
    }

    app.use(express.static(distPath, { index: false }));
    app.get('*', (req, res) => {
      if (template) {
        const html = injectSeoIntoHtml(template, req.originalUrl, INITIAL_VENDORS, INITIAL_PRODUCTS);
        res.status(200).set({ 'Content-Type': 'text/html; charset=utf-8' }).end(html);
      } else {
        res.sendFile(indexPath);
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

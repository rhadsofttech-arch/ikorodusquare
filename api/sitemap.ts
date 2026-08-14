import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateSitemapXml } from '../src/server/seoRenderer';
import { INITIAL_VENDORS, INITIAL_PRODUCTS } from '../src/data/mockData';

export default function handler(_req: VercelRequest, res: VercelResponse) {
  const xml = generateSitemapXml(INITIAL_VENDORS, INITIAL_PRODUCTS);
  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
  return res.status(200).send(xml);
}

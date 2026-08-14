import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateSitemapXml } from '../src/server/seoRenderer';
import { fetchVendorsFromSupabase, fetchProductsFromSupabase } from '../src/lib/supabaseDb';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const [vendors, products] = await Promise.all([
    fetchVendorsFromSupabase().catch(() => null),
    fetchProductsFromSupabase().catch(() => null),
  ]);
  const xml = generateSitemapXml(vendors || [], products || []);
  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
  return res.status(200).send(xml);
}

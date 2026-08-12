import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.VITE_SUPABASE_URL || '';
const key = process.env.VITE_SUPABASE_ANON_KEY || '';

const storageClient = createClient(url, key, {
  db: { schema: 'storage' }
});

const publicClient = createClient(url, key);

async function testSupabaseDb() {
  console.log('--- 1. Querying storage.buckets ---');
  const { data: buckets, error: bErr } = await storageClient.from('buckets').select('*');
  console.log('storage.buckets result:', { buckets, error: bErr });

  console.log('\n--- 2. Attempting to insert bucket into storage.buckets ---');
  const { data: insData, error: insErr } = await storageClient.from('buckets').insert([
    {
      id: 'product-images',
      name: 'product-images',
      public: true,
      file_size_limit: 10485760,
      allowed_mime_types: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
    }
  ]);
  console.log('Insert bucket result:', { insData, error: insErr });

  console.log('\n--- 3. Attempting to insert bucket "products" into storage.buckets ---');
  const { data: insData2, error: insErr2 } = await storageClient.from('buckets').insert([
    {
      id: 'products',
      name: 'products',
      public: true,
      file_size_limit: 10485760,
      allowed_mime_types: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
    }
  ]);
  console.log('Insert bucket "products" result:', { insData2, error: insErr2 });
}

testSupabaseDb().catch(console.error);

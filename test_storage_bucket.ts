import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.VITE_SUPABASE_URL || '';
const key = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!url || !key) {
  console.error('Missing Supabase env vars!');
  process.exit(1);
}

const supabase = createClient(url, key);

async function run() {
  console.log('--- 1. LIST BUCKETS ---');
  const { data: buckets, error: listErr } = await supabase.storage.listBuckets();
  console.log('List buckets result:', { buckets, error: listErr });

  console.log('\n--- 2. ATTEMPT CREATE BUCKET "product-images" ---');
  const { data: createData, error: createErr } = await supabase.storage.createBucket('product-images', {
    public: true,
    fileSizeLimit: 10485760
  });
  console.log('Create bucket result:', { createData, error: createErr });

  console.log('\n--- 3. ATTEMPT UPLOAD DUMMY IMAGE ---');
  const buffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
  const { data: uploadData, error: uploadErr } = await supabase.storage
    .from('product-images')
    .upload(`v-test/test_${Date.now()}.png`, buffer, {
      contentType: 'image/png',
      upsert: true
    });
  console.log('Upload result:', { uploadData, error: uploadErr });
}

run().catch(console.error);

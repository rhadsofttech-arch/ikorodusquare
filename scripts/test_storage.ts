import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const url = process.env.VITE_SUPABASE_URL || '';
const key = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!url || !key) {
  console.error('Supabase credentials missing!');
  process.exit(1);
}

const supabase = createClient(url, key);

async function testStorage() {
  console.log('=== 1. LISTING SUPABASE STORAGE BUCKETS ===');
  const { data: buckets, error: bErr } = await supabase.storage.listBuckets();
  if (bErr) {
    console.error('Error listing buckets:', bErr);
  } else {
    console.log('Buckets found:', buckets);
  }

  console.log('\n=== 2. TESTING UPLOAD TO "product-images" BUCKET ===');
  // Create a tiny 1x1 dummy PNG image buffer
  const dummyBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
  const testFileName = `test_${Date.now()}.png`;

  const { data: upData, error: upErr } = await supabase.storage
    .from('product-images')
    .upload(`test_folder/${testFileName}`, dummyBuffer, {
      contentType: 'image/png',
      upsert: true
    });

  if (upErr) {
    console.error('Upload to "product-images" failed:', {
      message: upErr.message,
      name: upErr.name,
      statusCode: (upErr as any).statusCode,
      error: upErr
    });
  } else {
    console.log('Upload to "product-images" SUCCESS:', upData);
    const { data: pubUrl } = supabase.storage.from('product-images').getPublicUrl(upData.path);
    console.log('Public URL generated:', pubUrl.publicUrl);
  }

  console.log('\n=== 3. TESTING UPLOAD TO "products" BUCKET ===');
  const { data: upData2, error: upErr2 } = await supabase.storage
    .from('products')
    .upload(`test_folder/${testFileName}`, dummyBuffer, {
      contentType: 'image/png',
      upsert: true
    });

  if (upErr2) {
    console.error('Upload to "products" failed:', {
      message: upErr2.message,
      name: upErr2.name,
      statusCode: (upErr2 as any).statusCode,
      error: upErr2
    });
  } else {
    console.log('Upload to "products" SUCCESS:', upData2);
  }

  console.log('\n=== 4. TESTING UPLOAD TO "public" BUCKET ===');
  const { data: upData3, error: upErr3 } = await supabase.storage
    .from('public')
    .upload(`test_folder/${testFileName}`, dummyBuffer, {
      contentType: 'image/png',
      upsert: true
    });

  if (upErr3) {
    console.error('Upload to "public" failed:', {
      message: upErr3.message,
      name: upErr3.name,
      statusCode: (upErr3 as any).statusCode,
      error: upErr3
    });
  } else {
    console.log('Upload to "public" SUCCESS:', upData3);
  }

  console.log('\n=== 5. CHECKING CURRENT AUTH USER ===');
  const { data: authData, error: authErr } = await supabase.auth.getUser();
  console.log('Auth user check:', { user: authData?.user?.id, error: authErr?.message });
}

testStorage().catch(console.error);

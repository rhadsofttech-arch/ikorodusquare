import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.VITE_SUPABASE_URL || '';
const key = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(url, key);

async function testBucketCreation() {
  console.log('Attempting to create "product-images" bucket via client...');
  const { data, error } = await supabase.storage.createBucket('product-images', {
    public: true,
    fileSizeLimit: 10485760, // 10MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
  });

  if (error) {
    console.error('Create bucket failed:', {
      message: error.message,
      name: error.name,
      error
    });
  } else {
    console.log('Create bucket succeeded:', data);
  }
}

testBucketCreation();

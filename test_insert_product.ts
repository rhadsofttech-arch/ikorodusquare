import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.VITE_SUPABASE_URL || '';
const key = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(url, key);

async function testInsertProduct() {
  console.log('--- Testing Product Insert ---');
  const dummyProduct = {
    id: `prod_test_${Date.now()}`,
    vendor_id: 'v-1786036744991',
    name: 'Test Product Upload',
    price: 5000,
    category: 'Fashion & Apparel',
    description: 'Test product image upload persistence',
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'],
    is_available: true,
    created_at: new Date().toISOString()
  };

  const { data, error } = await supabase.from('products').insert([dummyProduct]).select();
  console.log('Insert result:', { data, error });

  if (data && data.length > 0) {
    const { error: delErr } = await supabase.from('products').delete().eq('id', dummyProduct.id);
    console.log('Cleaned up test product:', delErr);
  }
}

testInsertProduct().catch(console.error);

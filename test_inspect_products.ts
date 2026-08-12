import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.VITE_SUPABASE_URL || '';
const key = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(url, key);

async function inspectProductsTable() {
  console.log('--- Inspecting products table ---');
  const { data, error } = await supabase.from('products').select('*').limit(1);
  console.log('Select result:', { data, error });
}

inspectProductsTable().catch(console.error);

import dotenv from 'dotenv';
dotenv.config();

console.log('ENV KEYS AVAILABLE:', Object.keys(process.env).filter(k => k.includes('SUPABASE') || k.includes('POSTGRES') || k.includes('DB') || k.includes('SERVICE')));
console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL);

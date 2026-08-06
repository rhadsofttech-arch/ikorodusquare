-- Supabase Database Schema for IkoroduSquare Platform
-- Run this script in the Supabase SQL Editor (https://app.supabase.com/project/_/sql)

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'customer',
  area TEXT DEFAULT 'Sabo',
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id OR true);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE USING (auth.uid() = id OR true);

-- 2. VENDORS TABLE
CREATE TABLE IF NOT EXISTS public.vendors (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  business_name TEXT NOT NULL,
  slug TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  description TEXT,
  address TEXT,
  area TEXT NOT NULL,
  lga TEXT DEFAULT 'Ikorodu',
  state TEXT DEFAULT 'Lagos State',
  country TEXT DEFAULT 'Nigeria',
  phone TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  website TEXT,
  instagram TEXT,
  facebook TEXT,
  tiktok TEXT,
  years_in_business INT DEFAULT 1,
  logo_url TEXT,
  cover_image_url TEXT,
  gallery_urls JSONB DEFAULT '[]'::jsonb,
  cac_certificate_url TEXT,
  nin_doc_url TEXT,
  owner_name TEXT NOT NULL,
  owner_email TEXT NOT NULL,
  owner_phone TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  is_verified BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false,
  rating NUMERIC(3, 1) DEFAULT 0,
  review_count INT DEFAULT 0,
  business_hours JSONB DEFAULT '[]'::jsonb,
  delivery_areas JSONB DEFAULT '[]'::jsonb,
  views_count INT DEFAULT 0,
  whatsapp_clicks INT DEFAULT 0,
  phone_clicks INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors viewable by everyone" ON public.vendors FOR SELECT USING (true);
CREATE POLICY "Anyone can register vendor" ON public.vendors FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update vendor" ON public.vendors FOR UPDATE USING (true);

-- 3. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  vendor_id TEXT NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  vendor_name TEXT NOT NULL,
  vendor_area TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'product',
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  sale_price NUMERIC,
  sku TEXT,
  stock INT DEFAULT 10,
  category TEXT NOT NULL,
  subcategory TEXT,
  brand TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  condition TEXT DEFAULT 'New',
  availability TEXT DEFAULT 'In Stock',
  delivery_options JSONB DEFAULT '[]'::jsonb,
  images JSONB DEFAULT '[]'::jsonb,
  is_featured BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'approved',
  views_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products viewable by everyone" ON public.products FOR SELECT USING (true);
CREATE POLICY "Anyone can insert product" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update product" ON public.products FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete product" ON public.products FOR DELETE USING (true);

-- 4. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
  id TEXT PRIMARY KEY,
  vendor_id TEXT NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
  customer_id TEXT DEFAULT 'c-101',
  customer_name TEXT NOT NULL,
  customer_avatar TEXT,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  vendor_reply TEXT,
  vendor_replied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews viewable by everyone" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Anyone can submit review" ON public.reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update review" ON public.reviews FOR UPDATE USING (true);

-- 5. ENQUIRIES TABLE
CREATE TABLE IF NOT EXISTS public.enquiries (
  id TEXT PRIMARY KEY,
  vendor_id TEXT NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  vendor_name TEXT NOT NULL,
  customer_id TEXT DEFAULT 'c-101',
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new',
  reply_text TEXT,
  replied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enquiries viewable by everyone" ON public.enquiries FOR SELECT USING (true);
CREATE POLICY "Anyone can send enquiry" ON public.enquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update enquiry" ON public.enquiries FOR UPDATE USING (true);

-- 6. PROMOTION REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.promotion_requests (
  id TEXT PRIMARY KEY,
  vendor_id TEXT NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  vendor_name TEXT NOT NULL,
  promo_type TEXT NOT NULL,
  promo_title TEXT NOT NULL,
  amount_naira NUMERIC NOT NULL,
  duration_weeks INT NOT NULL DEFAULT 1,
  bank_name TEXT DEFAULT 'First City Monument Bank (FCMB)',
  account_name TEXT DEFAULT 'Rhadsoft Tech - IkoroduSquare',
  account_number TEXT DEFAULT '9474918014',
  proof_url TEXT,
  proof_file_name TEXT,
  txn_ref TEXT,
  notes TEXT,
  status TEXT DEFAULT 'pending',
  admin_note TEXT,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
);

ALTER TABLE public.promotion_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Promotions viewable by everyone" ON public.promotion_requests FOR SELECT USING (true);
CREATE POLICY "Anyone can create promotion request" ON public.promotion_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update promotion request" ON public.promotion_requests FOR UPDATE USING (true);

-- 7. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  target_role TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Notifications viewable by everyone" ON public.notifications FOR SELECT USING (true);
CREATE POLICY "Anyone can create notification" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update notification" ON public.notifications FOR UPDATE USING (true);

-- 8. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  performed_by TEXT NOT NULL,
  role TEXT NOT NULL,
  details TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Audit logs viewable by everyone" ON public.audit_logs FOR SELECT USING (true);
CREATE POLICY "Anyone can create audit log" ON public.audit_logs FOR INSERT WITH CHECK (true);

-- ====================================================================
-- SUPABASE STORAGE CONFIGURATION & RLS POLICIES FOR PRODUCT IMAGES
-- ====================================================================
-- Execute this script in your Supabase SQL Editor:
-- https://app.supabase.com/project/_/sql

-- 1. CREATE STORAGE BUCKET: product-images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

-- 2. ENABLE ROW LEVEL SECURITY ON STORAGE OBJECTS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. RLS POLICY: Public Read Access
-- Allows any guest or customer to view product images in the marketplace
DROP POLICY IF EXISTS "Public Read Access for product-images" ON storage.objects;
CREATE POLICY "Public Read Access for product-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- 4. RLS POLICY: Authenticated Vendor Insert
-- Allows authenticated vendors to upload images into their folder structure: product-images/{vendorId}/*
DROP POLICY IF EXISTS "Authenticated Vendor Insert for product-images" ON storage.objects;
CREATE POLICY "Authenticated Vendor Insert for product-images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images'
  AND (storage.foldername(name))[1] IS NOT NULL
);

-- 5. RLS POLICY: Authenticated Vendor Update
-- Allows authenticated vendors to update or replace their product images
DROP POLICY IF EXISTS "Authenticated Vendor Update for product-images" ON storage.objects;
CREATE POLICY "Authenticated Vendor Update for product-images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product-images'
  AND (storage.foldername(name))[1] IS NOT NULL
);

-- 6. RLS POLICY: Authenticated Vendor Delete
-- Allows authenticated vendors to delete their product images when removing them from products
DROP POLICY IF EXISTS "Authenticated Vendor Delete for product-images" ON storage.objects;
CREATE POLICY "Authenticated Vendor Delete for product-images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images'
  AND (storage.foldername(name))[1] IS NOT NULL
);

-- ====================================================================
-- STORAGE BUCKET: verification-receipts (₦3,000 Vendor Verification Proofs)
-- ====================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'verification-receipts',
  'verification-receipts',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'application/pdf'];


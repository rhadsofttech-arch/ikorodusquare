-- ====================================================================
-- SUPABASE STORAGE CONFIGURATION & RLS POLICIES FOR IKORODUSQUARE
-- ====================================================================
-- Execute this script in your Supabase SQL Editor:
-- https://app.supabase.com/project/_/sql

-- 1. ENABLE ROW LEVEL SECURITY ON STORAGE OBJECTS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- ====================================================================
-- BUCKET 1: vendor-logos (Public Read, Authenticated Vendor Write)
-- ====================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'vendor-logos',
  'vendor-logos',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

DROP POLICY IF EXISTS "Public Read Access for vendor-logos" ON storage.objects;
CREATE POLICY "Public Read Access for vendor-logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'vendor-logos');

DROP POLICY IF EXISTS "Authenticated Upload for vendor-logos" ON storage.objects;
CREATE POLICY "Authenticated Upload for vendor-logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'vendor-logos');

DROP POLICY IF EXISTS "Authenticated Update for vendor-logos" ON storage.objects;
CREATE POLICY "Authenticated Update for vendor-logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'vendor-logos');

DROP POLICY IF EXISTS "Authenticated Delete for vendor-logos" ON storage.objects;
CREATE POLICY "Authenticated Delete for vendor-logos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'vendor-logos');

-- ====================================================================
-- BUCKET 2: vendor-covers (Public Read, Authenticated Vendor Write)
-- ====================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'vendor-covers',
  'vendor-covers',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

DROP POLICY IF EXISTS "Public Read Access for vendor-covers" ON storage.objects;
CREATE POLICY "Public Read Access for vendor-covers"
ON storage.objects FOR SELECT
USING (bucket_id = 'vendor-covers');

DROP POLICY IF EXISTS "Authenticated Upload for vendor-covers" ON storage.objects;
CREATE POLICY "Authenticated Upload for vendor-covers"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'vendor-covers');

DROP POLICY IF EXISTS "Authenticated Update for vendor-covers" ON storage.objects;
CREATE POLICY "Authenticated Update for vendor-covers"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'vendor-covers');

DROP POLICY IF EXISTS "Authenticated Delete for vendor-covers" ON storage.objects;
CREATE POLICY "Authenticated Delete for vendor-covers"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'vendor-covers');

-- ====================================================================
-- BUCKET 3: vendor-gallery (Public Read, Authenticated Vendor Write)
-- ====================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'vendor-gallery',
  'vendor-gallery',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

DROP POLICY IF EXISTS "Public Read Access for vendor-gallery" ON storage.objects;
CREATE POLICY "Public Read Access for vendor-gallery"
ON storage.objects FOR SELECT
USING (bucket_id = 'vendor-gallery');

DROP POLICY IF EXISTS "Authenticated Upload for vendor-gallery" ON storage.objects;
CREATE POLICY "Authenticated Upload for vendor-gallery"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'vendor-gallery');

DROP POLICY IF EXISTS "Authenticated Update for vendor-gallery" ON storage.objects;
CREATE POLICY "Authenticated Update for vendor-gallery"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'vendor-gallery');

DROP POLICY IF EXISTS "Authenticated Delete for vendor-gallery" ON storage.objects;
CREATE POLICY "Authenticated Delete for vendor-gallery"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'vendor-gallery');

-- ====================================================================
-- BUCKET 4: product-images (Public Read, Authenticated Vendor Write)
-- ====================================================================
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

DROP POLICY IF EXISTS "Public Read Access for product-images" ON storage.objects;
CREATE POLICY "Public Read Access for product-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Authenticated Vendor Insert for product-images" ON storage.objects;
CREATE POLICY "Authenticated Vendor Insert for product-images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images'
  AND (storage.foldername(name))[1] IS NOT NULL
);

DROP POLICY IF EXISTS "Authenticated Vendor Update for product-images" ON storage.objects;
CREATE POLICY "Authenticated Vendor Update for product-images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product-images'
  AND (storage.foldername(name))[1] IS NOT NULL
);

DROP POLICY IF EXISTS "Authenticated Vendor Delete for product-images" ON storage.objects;
CREATE POLICY "Authenticated Vendor Delete for product-images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images'
  AND (storage.foldername(name))[1] IS NOT NULL
);

-- ====================================================================
-- BUCKET 5: promotion-receipts (Private - Authenticated Upload, Admin Read)
-- ====================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'promotion-receipts',
  'promotion-receipts',
  false, -- Private bucket
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'application/pdf'];

DROP POLICY IF EXISTS "Authenticated Upload for promotion-receipts" ON storage.objects;
CREATE POLICY "Authenticated Upload for promotion-receipts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'promotion-receipts');

DROP POLICY IF EXISTS "Admin Read Access for promotion-receipts" ON storage.objects;
CREATE POLICY "Admin Read Access for promotion-receipts"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'promotion-receipts');

-- ====================================================================
-- BUCKET 6: verification-receipts (Private - Authenticated Upload, Admin Read)
-- ====================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'verification-receipts',
  'verification-receipts',
  false, -- Private bucket
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'application/pdf'];

DROP POLICY IF EXISTS "Authenticated Upload for verification-receipts" ON storage.objects;
CREATE POLICY "Authenticated Upload for verification-receipts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'verification-receipts');

DROP POLICY IF EXISTS "Admin Read Access for verification-receipts" ON storage.objects;
CREATE POLICY "Admin Read Access for verification-receipts"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'verification-receipts');

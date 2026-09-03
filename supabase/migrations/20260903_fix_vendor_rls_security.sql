-- ====================================================================
-- SUPABASE MIGRATION: 20260903_fix_vendor_rls_security.sql
-- PURPOSE: Fix critical unrestricted DELETE and UPDATE policies on public.vendors
-- ====================================================================

-- 1. Ensure RLS is active
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

-- 2. Drop insecure legacy policies
DROP POLICY IF EXISTS "Anyone can delete vendor" ON public.vendors;
DROP POLICY IF EXISTS "Anyone can update vendor" ON public.vendors;

-- 3. Create hardened UPDATE policy: Only vendor owner (auth.uid() = user_id) or administrator
CREATE POLICY "Admins and vendor owners can update vendors"
ON public.vendors
FOR UPDATE
TO authenticated
USING (
  auth.uid() = '7abcf01d-596d-4b47-a049-820e01f93f67'::uuid
  OR auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  auth.uid() = '7abcf01d-596d-4b47-a049-820e01f93f67'::uuid
  OR auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- 4. Create hardened DELETE policy: ONLY authorized administrators
CREATE POLICY "Only authorized administrators can delete vendors"
ON public.vendors
FOR DELETE
TO authenticated
USING (
  auth.uid() = '7abcf01d-596d-4b47-a049-820e01f93f67'::uuid
  OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

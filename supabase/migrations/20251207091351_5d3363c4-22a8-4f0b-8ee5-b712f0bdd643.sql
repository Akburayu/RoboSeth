-- Make storage buckets private
UPDATE storage.buckets SET public = false WHERE id = 'firma-documents';
UPDATE storage.buckets SET public = false WHERE id = 'entegrator-documents';

-- Drop existing policies if any
DROP POLICY IF EXISTS "Firma document owners can view" ON storage.objects;
DROP POLICY IF EXISTS "Firma document owners can upload" ON storage.objects;
DROP POLICY IF EXISTS "Firma document owners can update" ON storage.objects;
DROP POLICY IF EXISTS "Firma document owners can delete" ON storage.objects;
DROP POLICY IF EXISTS "Entegrator document owners can view" ON storage.objects;
DROP POLICY IF EXISTS "Entegrator document owners can upload" ON storage.objects;
DROP POLICY IF EXISTS "Entegrator document owners can update" ON storage.objects;
DROP POLICY IF EXISTS "Entegrator document owners can delete" ON storage.objects;

-- Firma documents policies - restrict to document owners
CREATE POLICY "Firma document owners can view"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'firma-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Firma document owners can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'firma-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Firma document owners can update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'firma-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Firma document owners can delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'firma-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Entegrator documents policies - restrict to document owners
CREATE POLICY "Entegrator document owners can view"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'entegrator-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Entegrator document owners can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'entegrator-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Entegrator document owners can update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'entegrator-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Entegrator document owners can delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'entegrator-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
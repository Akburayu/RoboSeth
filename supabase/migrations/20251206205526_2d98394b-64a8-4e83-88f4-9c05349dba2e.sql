-- Create entegrator-documents storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('entegrator-documents', 'entegrator-documents', true);

-- Allow authenticated users to upload their own documents
CREATE POLICY "Users can upload their own entegrator documents"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'entegrator-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to update their own documents
CREATE POLICY "Users can update their own entegrator documents"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'entegrator-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to delete their own documents
CREATE POLICY "Users can delete their own entegrator documents"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'entegrator-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public read access to entegrator documents
CREATE POLICY "Entegrator documents are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'entegrator-documents');
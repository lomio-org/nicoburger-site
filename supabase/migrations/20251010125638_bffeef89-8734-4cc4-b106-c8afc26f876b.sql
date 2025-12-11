-- Create storage bucket for painting images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'paintings',
  'paintings',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- Create RLS policies for paintings bucket
CREATE POLICY "Public can view painting images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'paintings');

CREATE POLICY "Admins can upload painting images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'paintings' 
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can update painting images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'paintings' 
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can delete painting images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'paintings' 
  AND public.has_role(auth.uid(), 'admin')
);
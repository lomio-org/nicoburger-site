-- Add medium_type column to paintings table
ALTER TABLE public.paintings 
ADD COLUMN medium_type text DEFAULT 'Acrylic';
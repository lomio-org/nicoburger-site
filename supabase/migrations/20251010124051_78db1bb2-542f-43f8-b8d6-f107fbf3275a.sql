-- Update RLS policies to use role-based authentication instead of hardcoded email

-- Drop old policies for paintings table
DROP POLICY IF EXISTS "admin_select_paintings" ON public.paintings;
DROP POLICY IF EXISTS "admin_insert_paintings" ON public.paintings;
DROP POLICY IF EXISTS "admin_update_paintings" ON public.paintings;
DROP POLICY IF EXISTS "admin_delete_paintings" ON public.paintings;

-- Create new role-based policies for paintings table
CREATE POLICY "admin_select_paintings"
ON public.paintings
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin_insert_paintings"
ON public.paintings
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin_update_paintings"
ON public.paintings
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin_delete_paintings"
ON public.paintings
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Drop old policies for painting_images table
DROP POLICY IF EXISTS "admin_select_painting_images" ON public.painting_images;
DROP POLICY IF EXISTS "admin_insert_painting_images" ON public.painting_images;
DROP POLICY IF EXISTS "admin_update_painting_images" ON public.painting_images;
DROP POLICY IF EXISTS "admin_delete_painting_images" ON public.painting_images;

-- Create new role-based policies for painting_images table
CREATE POLICY "admin_select_painting_images"
ON public.painting_images
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin_insert_painting_images"
ON public.painting_images
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin_update_painting_images"
ON public.painting_images
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin_delete_painting_images"
ON public.painting_images
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
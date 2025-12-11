-- Fix function search paths for security

-- Update the update_updated_at_column function with proper search path
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Update the generate_unique_slug function with proper search path
create or replace function public.generate_unique_slug(title_text text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  base_slug text;
  final_slug text;
  counter int := 1;
begin
  base_slug := lower(regexp_replace(trim(title_text), '[^a-zA-Z0-9\s-]', '', 'g'));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  base_slug := trim(both '-' from base_slug);
  
  final_slug := base_slug;
  
  while exists (select 1 from public.paintings where slug = final_slug) loop
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  end loop;
  
  return final_slug;
end;
$$;
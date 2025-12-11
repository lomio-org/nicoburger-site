-- Enable UUID extension
create extension if not exists pgcrypto;

-- Create paintings table
create table if not exists public.paintings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  height_cm numeric,
  width_cm numeric,
  description text,
  price_zar numeric,
  status text not null check (status in ('available','sold','hidden')) default 'available',
  slug text unique not null,
  sort_index int default 1000,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create painting_images table
create table if not exists public.painting_images (
  id uuid primary key default gen_random_uuid(),
  painting_id uuid not null references public.paintings(id) on delete cascade,
  image_url text not null,
  alt text,
  is_primary boolean default false,
  position int default 0,
  constraint painting_images_primary_alt_required
    check (is_primary is not true or (alt is not null and length(trim(alt)) > 0))
);

-- Create indexes for performance
create index if not exists paintings_status_idx on public.paintings(status);
create index if not exists paintings_sort_idx on public.paintings(sort_index, created_at desc);
create index if not exists painting_images_painting_idx on public.painting_images(painting_id);

-- Enforce at most one primary image per painting
create unique index if not exists painting_images_one_primary_per_painting
  on public.painting_images(painting_id) where is_primary;

-- Function to update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to auto-update updated_at
create trigger update_paintings_updated_at
  before update on public.paintings
  for each row
  execute function public.update_updated_at_column();

-- Function to generate unique slug
create or replace function public.generate_unique_slug(title_text text)
returns text as $$
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
$$ language plpgsql;

-- Enable Row Level Security
alter table public.paintings enable row level security;
alter table public.painting_images enable row level security;

-- Public read policies for published paintings
create policy "public_read_paintings"
  on public.paintings
  for select
  to anon
  using (status in ('available','sold'));

create policy "public_read_painting_images"
  on public.painting_images
  for select
  to anon
  using (
    exists (
      select 1 from public.paintings p
      where p.id = painting_images.painting_id
        and p.status in ('available','sold')
    )
  );

-- Admin policies for paintings (restricted to info@nicoburger.co.za)
create policy "admin_insert_paintings"
  on public.paintings
  for insert
  to authenticated
  with check ((auth.jwt() ->> 'email') = 'info@nicoburger.co.za');

create policy "admin_update_paintings"
  on public.paintings
  for update
  to authenticated
  using ((auth.jwt() ->> 'email') = 'info@nicoburger.co.za')
  with check ((auth.jwt() ->> 'email') = 'info@nicoburger.co.za');

create policy "admin_delete_paintings"
  on public.paintings
  for delete
  to authenticated
  using ((auth.jwt() ->> 'email') = 'info@nicoburger.co.za');

create policy "admin_select_paintings"
  on public.paintings
  for select
  to authenticated
  using ((auth.jwt() ->> 'email') = 'info@nicoburger.co.za');

-- Admin policies for painting_images
create policy "admin_insert_painting_images"
  on public.painting_images
  for insert
  to authenticated
  with check ((auth.jwt() ->> 'email') = 'info@nicoburger.co.za');

create policy "admin_update_painting_images"
  on public.painting_images
  for update
  to authenticated
  using ((auth.jwt() ->> 'email') = 'info@nicoburger.co.za')
  with check ((auth.jwt() ->> 'email') = 'info@nicoburger.co.za');

create policy "admin_delete_painting_images"
  on public.painting_images
  for delete
  to authenticated
  using ((auth.jwt() ->> 'email') = 'info@nicoburger.co.za');

create policy "admin_select_painting_images"
  on public.painting_images
  for select
  to authenticated
  using ((auth.jwt() ->> 'email') = 'info@nicoburger.co.za');

-- Storage policies for paintings bucket
create policy "public_can_read_paintings_bucket"
  on storage.objects
  for select
  to public
  using (bucket_id = 'paintings');

create policy "nico_can_insert_paintings_bucket"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'paintings' and (auth.jwt() ->> 'email') = 'info@nicoburger.co.za');

create policy "nico_can_update_paintings_bucket"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'paintings' and (auth.jwt() ->> 'email') = 'info@nicoburger.co.za');

create policy "nico_can_delete_paintings_bucket"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'paintings' and (auth.jwt() ->> 'email') = 'info@nicoburger.co.za');
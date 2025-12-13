export interface PaintingImage {
  id: string;
  painting_id: string;
  image_url: string;
  alt: string | null;
  is_primary: boolean;
  is_secondary: boolean;
  position: number;
}

export interface Painting {
  id: string;
  title: string;
  height_cm: number | null;
  width_cm: number | null;
  description: string | null;
  price_zar: number | null;
  status: 'available' | 'sold' | 'hidden';
  slug: string;
  sort_index: number;
  created_at: string;
  updated_at: string;
  medium_type: string | null;
  frame_included: boolean | null;
  painting_images?: PaintingImage[];
  primary_image?: PaintingImage;
  secondary_image?: PaintingImage;
  all_images?: PaintingImage[];
}

export interface ImageFile {
  id?: string;
  file?: File;
  preview: string;
  is_primary: boolean;
  is_secondary: boolean;
  alt: string;
  position: number;
  image_url?: string;
}

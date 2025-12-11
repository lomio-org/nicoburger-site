import { z } from 'zod';

export const paintingSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  height_cm: z.number().positive("Height must be positive").optional().nullable(),
  width_cm: z.number().positive("Width must be positive").optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  price_zar: z.number().positive("Price must be positive").optional().nullable(),
  status: z.enum(['available', 'sold', 'hidden'])
});

export type PaintingFormData = z.infer<typeof paintingSchema>;

/**
 * Validates image array ensuring primary and secondary image rules:
 * - If 1 image: auto-set as primary
 * - If >1 images: require explicit primary selection
 * - If >1 images: secondary image recommended (for in-situ preview)
 * - Primary image must have alt text
 */
export function validateImages(images: any[]): string | null {
  if (images.length === 0) {
    return "Please upload at least 1 image";
  }
  
  if (images.length > 6) {
    return "Maximum 6 images allowed";
  }
  
  // If more than 1 image, require explicit primary selection
  if (images.length > 1 && !images.some(img => img.is_primary)) {
    return "Please select a primary image by clicking 'Set as Primary'";
  }
  
  // If more than 1 image, recommend secondary selection
  if (images.length > 1 && !images.some(img => img.is_secondary)) {
    return "Please select a secondary image by clicking 'Set as Secondary' (this will be shown first in preview)";
  }
  
  // Primary image must have alt text
  const primaryImage = images.find(img => img.is_primary);
  if (primaryImage && (!primaryImage.alt || primaryImage.alt.trim().length === 0)) {
    return "Please provide alt text for the primary image";
  }
  
  return null;
}

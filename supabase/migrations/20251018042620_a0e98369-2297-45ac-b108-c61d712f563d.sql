-- Add is_secondary column to painting_images table
ALTER TABLE painting_images
ADD COLUMN is_secondary boolean DEFAULT false;

-- Create index for efficient secondary image lookups
CREATE INDEX idx_painting_images_secondary ON painting_images(painting_id, is_secondary)
WHERE is_secondary = true;

-- Add comment explaining the secondary image concept
COMMENT ON COLUMN painting_images.is_secondary IS 'The secondary image (typically the in-situ/framed image) shown first in customer preview';
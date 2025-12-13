-- Add frame_included column to paintings table
ALTER TABLE paintings 
ADD COLUMN frame_included boolean DEFAULT false;

COMMENT ON COLUMN paintings.frame_included IS 'Indicates whether a frame is included with the painting';
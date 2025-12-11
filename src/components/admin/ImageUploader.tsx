import { useEffect } from 'react';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImageFile } from '@/types/painting';
import { X, Upload, GripVertical } from 'lucide-react';

interface ImageUploaderProps {
  images: ImageFile[];
  onChange: (images: ImageFile[]) => void;
}

export const ImageUploader = ({ images, onChange }: ImageUploaderProps) => {
  // Auto-set primary when only one image exists
  useEffect(() => {
    if (images.length === 1 && !images[0].is_primary) {
      onChange([{ ...images[0], is_primary: true }]);
    }
  }, [images.length]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (images.length + files.length > 6) {
      alert('Maximum 6 images allowed');
      return;
    }

    const newImages: ImageFile[] = files.map((file, index) => ({
      file,
      preview: URL.createObjectURL(file),
      is_primary: images.length === 0 && index === 0, // Auto-primary if first image
      is_secondary: images.length === 1 && index === 0, // Auto-secondary if second image
      alt: '',
      position: images.length + index
    }));

    onChange([...images, ...newImages]);
  };

  const handleRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    
    // If removing the primary and only one left, auto-set remaining as primary
    if (newImages.length === 1) {
      newImages[0] = { ...newImages[0], is_primary: true };
    }
    
    onChange(newImages);
  };

  const handleSetPrimary = (index: number) => {
    onChange(images.map((img, i) => ({
      ...img,
      is_primary: i === index
    })));
  };

  const handleSetSecondary = (index: number) => {
    onChange(images.map((img, i) => ({
      ...img,
      is_secondary: i === index
    })));
  };

  const handleAltChange = (index: number, alt: string) => {
    onChange(images.map((img, i) => 
      i === index ? { ...img, alt } : img
    ));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;

    const oldIndex = images.findIndex((_, i) => i === parseInt(active.id as string));
    const newIndex = images.findIndex((_, i) => i === parseInt(over.id as string));

    const reordered = [...images];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);

    onChange(reordered.map((img, i) => ({ ...img, position: i })));
  };

  const primaryImage = images.find(img => img.is_primary);
  const secondaryImage = images.find(img => img.is_secondary);
  const showPrimarySelection = images.length > 1;
  const showSecondarySelection = images.length > 1;

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
    );
    
    if (images.length + files.length > 6) {
      alert('Maximum 6 images allowed');
      return;
    }

    const newImages: ImageFile[] = files.map((file, index) => ({
      file,
      preview: URL.createObjectURL(file),
      is_primary: images.length === 0 && index === 0,
      is_secondary: images.length === 1 && index === 0,
      alt: '',
      position: images.length + index
    }));

    onChange([...images, ...newImages]);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Images * (1-6 images)</Label>
        <p className="text-sm text-muted-foreground mb-3">
          {images.length === 1 
            ? 'Single image is automatically set as primary' 
            : images.length === 2
              ? 'Click "Set as Primary" and "Set as Secondary" before saving'
              : images.length > 2 
                ? 'Select Primary (main image) and Secondary (in-situ image) before saving'
                : 'Upload at least 1 image'}
        </p>
      </div>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <SortableContext items={images.map((_, i) => i.toString())} strategy={rectSortingStrategy}>
            {images.map((image, index) => (
              <ImagePreview
                key={index}
                image={image}
                index={index}
                showPrimaryButton={showPrimarySelection}
                showSecondaryButton={showSecondarySelection}
                onRemove={() => handleRemove(index)}
                onSetPrimary={() => handleSetPrimary(index)}
                onSetSecondary={() => handleSetSecondary(index)}
                onAltChange={(alt) => handleAltChange(index, alt)}
              />
            ))}
          </SortableContext>
        </div>
      </DndContext>

      {images.length < 6 && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <Input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            id="image-upload"
          />
          <Label htmlFor="image-upload">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors">
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Click to upload or drag & drop images (max 5MB each)
              </p>
            </div>
          </Label>
        </div>
      )}

      {primaryImage && (
        <div className="space-y-2">
          <Label>Alt Text for Primary Image *</Label>
          <p className="text-xs text-muted-foreground mb-2">
            Describe what the painting shows for accessibility and SEO (e.g., "Colorful landscape with trees at sunset")
          </p>
          <Input
            value={primaryImage.alt}
            onChange={(e) => {
              const index = images.findIndex(img => img.is_primary);
              if (index !== -1) handleAltChange(index, e.target.value);
            }}
            placeholder="Describe the primary image"
          />
        </div>
      )}
    </div>
  );
};

interface ImagePreviewProps {
  image: ImageFile;
  index: number;
  showPrimaryButton: boolean;
  showSecondaryButton: boolean;
  onRemove: () => void;
  onSetPrimary: () => void;
  onSetSecondary: () => void;
  onAltChange: (alt: string) => void;
}

const ImagePreview = ({ image, index, showPrimaryButton, showSecondaryButton, onRemove, onSetPrimary, onSetSecondary }: ImagePreviewProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: index.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <img
        src={image.preview}
        alt={image.alt || `Image ${index + 1}`}
        className="w-full aspect-square object-cover rounded-lg"
      />
      
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 bg-background/80 p-1 rounded cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="w-4 h-4" />
      </div>

      {/* Remove button */}
      <Button
        type="button"
        variant="destructive"
        size="sm"
        className="absolute top-2 right-2 h-7 w-7 p-0"
        onClick={onRemove}
      >
        <X className="w-4 h-4" />
      </Button>

      {/* Primary and Secondary badges/buttons */}
      <div className="absolute bottom-2 left-2 right-2 space-y-1">
        {image.is_primary ? (
          <div className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium text-center">
            {showPrimaryButton ? '✓ Primary' : 'Primary (auto)'}
          </div>
        ) : showPrimaryButton ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="w-full text-xs"
            onClick={onSetPrimary}
          >
            Set as Primary
          </Button>
        ) : null}
        
        {image.is_secondary ? (
          <div className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs font-medium text-center">
            ✓ Secondary
          </div>
        ) : showSecondaryButton && !image.is_primary ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full text-xs"
            onClick={onSetSecondary}
          >
            Set as Secondary
          </Button>
        ) : null}
      </div>
    </div>
  );
};

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ImageUploader } from './ImageUploader';
import { paintingSchema, PaintingFormData, validateImages } from '@/lib/validation';
import { slugify } from '@/lib/slugify';
import { Painting, ImageFile } from '@/types/painting';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface PaintingFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  painting?: Painting;
}

export const PaintingFormModal = ({ open, onOpenChange, painting }: PaintingFormModalProps) => {
  const queryClient = useQueryClient();
  const [images, setImages] = useState<ImageFile[]>([]);
  const [saving, setSaving] = useState(false);
  
  const form = useForm<PaintingFormData>({
    resolver: zodResolver(paintingSchema),
    defaultValues: {
      title: '',
      height_cm: null,
      width_cm: null,
      description: '',
      price_zar: null,
      status: 'available',
      medium_type: 'Acrylic',
      frame_included: false
    }
  });

  // Load existing painting data
  useEffect(() => {
    if (painting && open) {
      form.reset({
        title: painting.title,
        height_cm: painting.height_cm,
        width_cm: painting.width_cm,
        description: painting.description,
        price_zar: painting.price_zar,
        status: painting.status,
        medium_type: painting.medium_type,
        frame_included: painting.frame_included
      });
      
      if (painting.all_images) {
        setImages(painting.all_images.map(img => ({
          id: img.id,
          preview: img.image_url,
          is_primary: img.is_primary,
          is_secondary: img.is_secondary,
          alt: img.alt || '',
          position: img.position,
          image_url: img.image_url
        })));
      }
    } else if (!open) {
      form.reset();
      setImages([]);
    }
  }, [painting, open, form]);

  const onSubmit = async (data: PaintingFormData) => {
    // Validate images
    const imageError = validateImages(images);
    if (imageError) {
      toast.error(imageError);
      return;
    }

    setSaving(true);

    try {
      if (painting) {
        await updatePainting(painting.id, data);
      } else {
        await createPainting(data);
      }
      
      queryClient.invalidateQueries({ queryKey: ['paintings'] });
      toast.success(painting ? 'Painting updated' : 'Painting created');
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save painting');
    } finally {
      setSaving(false);
    }
  };

  const createPainting = async (data: PaintingFormData) => {
    // Generate slug
    const { data: existingSlugs } = await supabase.rpc('generate_unique_slug', { title_text: data.title });
    const slug = existingSlugs || slugify(data.title);

    // Upload new images
    const uploadedImages = await uploadImages(images.filter(img => img.file));

    // Create painting
    const { data: newPainting, error: paintingError } = await supabase
      .from('paintings')
      .insert({
        title: data.title,
        height_cm: data.height_cm,
        width_cm: data.width_cm,
        description: data.description,
        price_zar: data.price_zar,
        status: data.status,
        medium_type: data.medium_type,
        frame_included: data.frame_included,
        slug
      })
      .select()
      .single();

    if (paintingError) throw paintingError;

    // Create image records
    const imageRecords = uploadedImages.map((img, index) => ({
      painting_id: newPainting.id,
      image_url: img.url,
      alt: img.alt,
      is_primary: img.is_primary,
      is_secondary: img.is_secondary,
      position: index
    }));

    const { error: imagesError } = await supabase
      .from('painting_images')
      .insert(imageRecords);

    if (imagesError) {
      // Rollback: delete painting
      await supabase.from('paintings').delete().eq('id', newPainting.id);
      throw imagesError;
    }
  };

  const updatePainting = async (id: string, data: PaintingFormData) => {
    // Update painting
    const { error: updateError } = await supabase
      .from('paintings')
      .update({
        title: data.title,
        height_cm: data.height_cm,
        width_cm: data.width_cm,
        description: data.description,
        price_zar: data.price_zar,
        status: data.status,
        medium_type: data.medium_type,
        frame_included: data.frame_included
      })
      .eq('id', id);

    if (updateError) throw updateError;

    // Handle images: upload new, keep existing, delete removed
    const imagesToUpload = images.filter(img => img.file);
    const imagesToKeep = images.filter(img => img.id);
    
    // Get original images to find deleted ones
    const { data: originalImages } = await supabase
      .from('painting_images')
      .select('*')
      .eq('painting_id', id);

    const imagesToDelete = (originalImages || []).filter(
      orig => !imagesToKeep.find(img => img.id === orig.id)
    );

    // Delete removed images from storage
    if (imagesToDelete.length > 0) {
      const filePaths = imagesToDelete.map(img => {
        const url = new URL(img.image_url);
        return url.pathname.split('/').pop()!;
      });
      await supabase.storage.from('paintings').remove(filePaths);
    }

    // Upload new images
    const uploadedImages = await uploadImages(imagesToUpload);

    // Delete all old image records
    await supabase.from('painting_images').delete().eq('painting_id', id);

    // Insert new complete set
    const allImageRecords = [
      ...imagesToKeep.map((img, index) => ({
        painting_id: id,
        image_url: img.image_url!,
        alt: img.alt,
        is_primary: img.is_primary,
        is_secondary: img.is_secondary,
        position: index
      })),
      ...uploadedImages.map((img, index) => ({
        painting_id: id,
        image_url: img.url,
        alt: img.alt,
        is_primary: img.is_primary,
        is_secondary: img.is_secondary,
        position: imagesToKeep.length + index
      }))
    ];

    const { error: insertError } = await supabase
      .from('painting_images')
      .insert(allImageRecords);

    if (insertError) throw insertError;
  };

  const uploadImages = async (imagesToUpload: ImageFile[]) => {
    const uploaded = [];
    
    for (const image of imagesToUpload) {
      if (!image.file) continue;
      
      const fileExt = image.file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('paintings')
        .upload(fileName, image.file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('paintings')
        .getPublicUrl(fileName);

      uploaded.push({
        url: publicUrl,
        alt: image.alt,
        is_primary: image.is_primary,
        is_secondary: image.is_secondary
      });
    }
    
    return uploaded;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{painting ? 'Edit Painting' : 'Add New Painting'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Painting title" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="height_cm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Height (mm)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value || ''}
                        onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="width_cm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Width (mm)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value || ''}
                        onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="medium_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} placeholder="e.g., Acrylic, Oil, Watercolor" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} value={field.value || ''} rows={4} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price_zar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (ZAR)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value || ''}
                        onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="sold">Sold</SelectItem>
                        <SelectItem value="hidden">Hidden</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="frame_included"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value || false}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Frame Included
                    </FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Check if this painting includes a frame
                    </p>
                  </div>
                </FormItem>
              )}
            />

            <ImageUploader images={images} onChange={setImages} />

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {painting ? 'Update' : 'Create'} Painting
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

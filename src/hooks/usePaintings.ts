import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Painting } from '@/types/painting';

export function usePaintings() {
  return useQuery({
    queryKey: ['paintings', 'public'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('paintings')
        .select(`
          id,
          title,
          slug,
          status,
          price_zar,
          height_cm,
          width_cm,
          description,
          painting_images (
            id,
            image_url,
            alt,
            is_primary,
            is_secondary,
            position
          )
        `)
        .in('status', ['available', 'sold'])
        .order('sort_index', { ascending: true })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map((painting: any) => ({
        ...painting,
        primary_image: painting.painting_images?.find((img: any) => img.is_primary),
        secondary_image: painting.painting_images?.find((img: any) => img.is_secondary),
        all_images: painting.painting_images?.sort((a: any, b: any) => a.position - b.position)
      })) as Painting[];
    }
  });
}

export function useAdminPaintings() {
  return useQuery({
    queryKey: ['paintings', 'admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('paintings')
        .select(`
          id,
          title,
          slug,
          status,
          price_zar,
          height_cm,
          width_cm,
          description,
          sort_index,
          updated_at,
          painting_images (
            id,
            image_url,
            alt,
            is_primary,
            is_secondary,
            position
          )
        `)
        .order('sort_index', { ascending: true })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map((painting: any) => ({
        ...painting,
        primary_image: painting.painting_images?.find((img: any) => img.is_primary),
        secondary_image: painting.painting_images?.find((img: any) => img.is_secondary),
        all_images: painting.painting_images?.sort((a: any, b: any) => a.position - b.position)
      })) as Painting[];
    }
  });
}

export function useUpdatePaintingStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('paintings')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paintings'] });
    }
  });
}

export function useUpdateSortIndex() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (paintings: { id: string; sort_index: number }[]) => {
      // Update individually since we don't have an RPC function
      for (const painting of paintings) {
        const { error: updateError } = await supabase
          .from('paintings')
          .update({ sort_index: painting.sort_index })
          .eq('id', painting.id);
        
        if (updateError) throw updateError;
      }
    },
    onMutate: async (newPaintings) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['paintings', 'admin'] });
      
      // Snapshot previous value
      const previousPaintings = queryClient.getQueryData(['paintings', 'admin']);
      
      // Optimistically update the cache
      queryClient.setQueryData(['paintings', 'admin'], (old: Painting[] | undefined) => {
        if (!old) return old;
        
        // Create a map of new sort indices
        const sortMap = new Map(newPaintings.map(p => [p.id, p.sort_index]));
        
        // Update and sort paintings by new sort_index
        return [...old]
          .map(painting => ({
            ...painting,
            sort_index: sortMap.get(painting.id) ?? painting.sort_index
          }))
          .sort((a, b) => a.sort_index - b.sort_index);
      });
      
      return { previousPaintings };
    },
    onError: (err, newPaintings, context) => {
      // Rollback on error
      if (context?.previousPaintings) {
        queryClient.setQueryData(['paintings', 'admin'], context.previousPaintings);
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['paintings'] });
    }
  });
}

export function useDeletePainting() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      // Get images to delete from storage
      const { data: images } = await supabase
        .from('painting_images')
        .select('image_url')
        .eq('painting_id', id);
      
      // Delete from database (cascade will handle painting_images)
      const { error } = await supabase
        .from('paintings')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Delete images from storage
      if (images && images.length > 0) {
        const filePaths = images.map(img => {
          const url = new URL(img.image_url);
          return url.pathname.split('/').slice(-1)[0];
        });
        
        await supabase.storage
          .from('paintings')
          .remove(filePaths);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paintings'] });
    }
  });
}

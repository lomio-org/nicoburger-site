import { useState } from 'react';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useAdminPaintings, useUpdatePaintingStatus, useUpdateSortIndex, useDeletePainting } from '@/hooks/usePaintings';
import { PaintingRow } from './PaintingRow';
import { PaintingFormModal } from './PaintingFormModal';
import { Painting } from '@/types/painting';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export const PaintingsList = () => {
  const { data: paintings, isLoading } = useAdminPaintings();
  const updateStatus = useUpdatePaintingStatus();
  const updateSortIndex = useUpdateSortIndex();
  const deletePainting = useDeletePainting();
  
  const [editingPainting, setEditingPainting] = useState<Painting | null>(null);
  const [deletingPainting, setDeletingPainting] = useState<Painting | null>(null);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id || !paintings) return;

    const oldIndex = paintings.findIndex(p => p.id === active.id);
    const newIndex = paintings.findIndex(p => p.id === over.id);

    const reordered = [...paintings];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);

    const updates = reordered.map((painting, index) => ({
      id: painting.id,
      sort_index: index * 10
    }));

    try {
      await updateSortIndex.mutateAsync(updates);
      toast.success('Order updated');
    } catch (error) {
      toast.error('Failed to update order');
    }
  };

  const handleToggleStatus = async (painting: Painting) => {
    const newStatus = painting.status === 'available' ? 'sold' : 'available';
    try {
      await updateStatus.mutateAsync({ id: painting.id, status: newStatus });
      toast.success(`Marked as ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleToggleHidden = async (painting: Painting) => {
    const newStatus = painting.status === 'hidden' ? 'available' : 'hidden';
    try {
      await updateStatus.mutateAsync({ id: painting.id, status: newStatus });
      toast.success(newStatus === 'hidden' ? 'Painting hidden' : 'Painting visible');
    } catch (error) {
      toast.error('Failed to update visibility');
    }
  };

  const handleDelete = async () => {
    if (!deletingPainting) return;
    
    try {
      await deletePainting.mutateAsync(deletingPainting.id);
      toast.success('Painting deleted');
      setDeletingPainting(null);
    } catch (error) {
      toast.error('Failed to delete painting');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!paintings || paintings.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-heading font-semibold mb-2">No paintings yet</h2>
        <p className="text-muted-foreground">Click "Add Painting" to create your first one!</p>
      </div>
    );
  }

  return (
    <>
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-muted/50">
                <tr className="text-left text-sm text-muted-foreground">
                  <th className="w-12 p-4"></th>
                  <th className="w-24 p-4">Image</th>
                  <th className="p-4">Title</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Updated</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <SortableContext items={paintings.map(p => p.id)} strategy={verticalListSortingStrategy}>
                  {paintings.map((painting) => (
                    <PaintingRow
                      key={painting.id}
                      painting={painting}
                      onEdit={() => setEditingPainting(painting)}
                      onToggleStatus={() => handleToggleStatus(painting)}
                      onToggleHidden={() => handleToggleHidden(painting)}
                      onDelete={() => setDeletingPainting(painting)}
                    />
                  ))}
                </SortableContext>
              </tbody>
            </table>
          </div>
        </div>
      </DndContext>

      <PaintingFormModal
        open={!!editingPainting}
        onOpenChange={(open) => !open && setEditingPainting(null)}
        painting={editingPainting || undefined}
      />

      <AlertDialog open={!!deletingPainting} onOpenChange={() => setDeletingPainting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Painting?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingPainting?.title}"? This will permanently delete the painting and all its images. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

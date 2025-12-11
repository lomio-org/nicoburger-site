import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Painting } from '@/types/painting';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GripVertical, Pencil, Eye, EyeOff, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PaintingRowProps {
  painting: Painting;
  onEdit: () => void;
  onToggleStatus: () => void;
  onToggleHidden: () => void;
  onDelete: () => void;
}

export const PaintingRow = ({ painting, onEdit, onToggleStatus, onToggleHidden, onDelete }: PaintingRowProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: painting.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr ref={setNodeRef} style={style} className="border-t border-border hover:bg-muted/30">
      <td className="p-4">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="w-5 h-5 text-muted-foreground" />
        </div>
      </td>
      <td className="p-4">
        {painting.primary_image && (
          <img
            src={painting.primary_image.image_url}
            alt={painting.primary_image.alt || painting.title}
            className="w-16 h-16 object-cover rounded"
          />
        )}
      </td>
      <td className="p-4 font-medium">{painting.title}</td>
      <td className="p-4">
        {painting.price_zar ? `R ${painting.price_zar}` : '—'}
      </td>
      <td className="p-4">
        <Badge variant={
          painting.status === 'available' ? 'default' :
          painting.status === 'sold' ? 'secondary' :
          'outline'
        }>
          {painting.status}
        </Badge>
      </td>
      <td className="p-4 text-sm text-muted-foreground">
        {formatDistanceToNow(new Date(painting.updated_at), { addSuffix: true })}
      </td>
      <td className="p-4">
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Pencil className="w-4 h-4" />
          </Button>
          {painting.status !== 'hidden' && (
            <Button variant="ghost" size="sm" onClick={onToggleStatus} title={painting.status === 'available' ? 'Mark as Sold' : 'Mark as Available'}>
              {painting.status === 'available' ? '✓' : '↻'}
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onToggleHidden} title={painting.status === 'hidden' ? 'Unhide' : 'Hide'}>
            {painting.status === 'hidden' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete} className="text-destructive hover:text-destructive">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
};

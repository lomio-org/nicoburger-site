import { useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, MessageCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Painting } from "@/types/painting";
import useEmblaCarousel from 'embla-carousel-react';

interface ArtworkDetailModalProps {
  artwork: Painting | null;
  onClose: () => void;
}

export const ArtworkDetailModal = ({ artwork, onClose }: ArtworkDetailModalProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  if (!artwork) return null;

  // Reorder images to show secondary image first if it exists
  const images = artwork.all_images || [];
  const reorderedImages = (() => {
    if (images.length === 0) return [];
    const secondary = images.find(img => img.is_secondary);
    if (!secondary) return images;
    const others = images.filter(img => !img.is_secondary);
    return [secondary, ...others];
  })();
  const hasMultipleImages = reorderedImages.length > 1;

  return (
    <Dialog open={!!artwork} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-heading text-3xl">
            {artwork.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 flex-1 flex flex-col">
          {/* Image Carousel */}
          <div className="relative flex-shrink-0">
            <div ref={emblaRef} className="overflow-hidden rounded-lg">
              <div className="flex">
                {reorderedImages.map((image) => (
                  <div key={image.id} className="flex-[0_0_100%] min-w-0">
                    <img
                      src={image.image_url}
                      alt={image.alt || artwork.title}
                      className="w-full h-auto max-h-[60vh] object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Arrows */}
            {hasMultipleImages && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                  onClick={scrollPrev}
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                  onClick={scrollNext}
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </>
            )}

            {/* Status Badge */}
            {artwork.status === 'sold' && (
              <div className="absolute top-4 right-4">
                <Badge variant="secondary" className="text-sm font-semibold">
                  SOLD
                </Badge>
              </div>
            )}
          </div>

          {/* Image Indicators */}
          {hasMultipleImages && (
            <div className="flex justify-center gap-2">
              {reorderedImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => emblaApi?.scrollTo(index)}
                  className="w-2 h-2 rounded-full bg-muted hover:bg-primary transition-colors"
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          )}

          <div className="space-y-4 flex-1 overflow-y-auto">
            {/* Dimensions */}
            {(artwork.height_cm || artwork.width_cm) && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-1">Size</h3>
                <p className="text-lg">
                  {artwork.height_cm && artwork.width_cm
                    ? `H${artwork.height_cm} × W${artwork.width_cm} cm`
                    : artwork.height_cm
                    ? `${artwork.height_cm}cm`
                    : `${artwork.width_cm}cm`}
                </p>
              </div>
            )}

            {/* Description */}
            {artwork.description && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-1">Description</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {artwork.description}
                </p>
              </div>
            )}

            {/* Price */}
            {artwork.status !== 'sold' && artwork.price_zar && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-1">Price</h3>
                <p className="text-2xl font-bold">R {artwork.price_zar}</p>
              </div>
            )}

            {/* CTAs */}
            <div className="pt-6 border-t border-border">
              <h3 className="text-sm font-semibold text-muted-foreground mb-4">
                Interested in this piece?
              </h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild className="flex-1">
                  <a
                    href={`https://wa.me/27825693884?text=Hi%20Nico,%20I'm%20interested%20in%20your%20painting%20"${encodeURIComponent(
                      artwork.title
                    )}"`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Chat on WhatsApp
                  </a>
                </Button>
                <Button variant="outline" asChild className="flex-1">
                  <a
                    href={`https://m.me/YOUR_PAGE_ID?text=Hi%20Nico,%20I'm%20interested%20in%20"${encodeURIComponent(
                      artwork.title
                    )}"`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Messenger
                  </a>
                </Button>
                <Button variant="outline" asChild className="flex-1">
                  <a href={`mailto:ndburger@iafrica.com?subject=Enquiry about "${artwork.title}"`}>
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

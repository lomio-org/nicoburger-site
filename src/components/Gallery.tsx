import { useState } from "react";
import { usePaintings } from "@/hooks/usePaintings";
import { Painting } from "@/types/painting";
import { GallerySkeleton } from "./GallerySkeleton";
import { EmptyGallery } from "./EmptyGallery";
import { ArtworkDetailModal } from "./ArtworkDetailModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Gallery = () => {
  const { data: paintings, isLoading, error } = usePaintings();
  const [selectedArtwork, setSelectedArtwork] = useState<Painting | null>(null);

  if (isLoading) {
    return <GallerySkeleton />;
  }

  if (error) {
    return (
      <section id="gallery" className="py-24 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="font-heading text-4xl md:text-5xl font-bold mb-6 text-foreground">
            Gallery
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Unable to load gallery. Please try again later.
          </p>
        </div>
      </section>
    );
  }

  if (!paintings || paintings.length === 0) {
    return <EmptyGallery />;
  }

  return (
    <>
      <section id="gallery" className="py-24 px-6" style={{ backgroundColor: 'hsl(40 30% 98%)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6">
              Gallery
            </h2>
            <div className="w-20 h-1 bg-primary mx-auto mb-8 rounded-full"></div>
            <p className="font-body text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              A growing collection of bright, minimalist landscapes — each one unique.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {paintings.map((painting, index) => (
              <div
                key={painting.id}
                className="group cursor-pointer animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => setSelectedArtwork(painting)}
              >
                <div className="relative overflow-hidden rounded-xl bg-card border border-border transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_24px_hsl(220_15%_35%_/_0.08)]" style={{ boxShadow: '0 2px 12px hsl(220 15% 35% / 0.05)' }}>
                  {painting.status === 'sold' && (
                    <div className="absolute top-4 right-4 z-10 bg-neutral-800/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                      SOLD
                    </div>
                  )}
                  <div className="aspect-square overflow-hidden bg-muted">
                    {painting.primary_image && (
                      <img
                        src={painting.primary_image.image_url}
                        alt={painting.primary_image.alt || painting.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <div className="p-6 bg-card">
                    <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                      {painting.title}
                    </h3>
                    <p className="font-body text-sm text-muted-foreground mb-4">
                      {painting.height_cm && painting.width_cm
                        ? `H${painting.height_cm} × W${painting.width_cm} mm`
                        : painting.height_cm
                        ? `${painting.height_cm} mm`
                        : painting.width_cm
                        ? `${painting.width_cm} mm`
                        : 'Size not specified'}
                    </p>
                    <Button
                      variant="outline"
                      className="w-full border-primary text-primary hover:bg-primary/10 hover:border-primary font-heading transition-all"
                    >
                      See Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ArtworkDetailModal
        artwork={selectedArtwork}
        onClose={() => setSelectedArtwork(null)}
      />
    </>
  );
};

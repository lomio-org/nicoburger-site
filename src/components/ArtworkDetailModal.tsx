import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, ChevronLeft, ChevronRight, Mail } from "lucide-react";

// Brand icon components
const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Painting } from "@/types/painting";
import useEmblaCarousel from "embla-carousel-react";
import { cn } from "@/lib/utils";

interface ArtworkDetailModalProps {
  artwork: Painting | null;
  onClose: () => void;
}

export const ArtworkDetailModal = ({ artwork, onClose }: ArtworkDetailModalProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenIndex, setFullscreenIndex] = useState(0);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPinching, setIsPinching] = useState(false);
  const lastDistance = useRef<number>(0);
  const lastScale = useRef<number>(1);

  // Update selected index when carousel scrolls
  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on("select", onSelect);
    onSelect();

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  // Keyboard navigation for fullscreen
  useEffect(() => {
    if (!isFullscreen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeFullscreen();
      } else if (e.key === "ArrowLeft") {
        navigateFullscreen("prev");
      } else if (e.key === "ArrowRight") {
        navigateFullscreen("next");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  if (!artwork) return null;

  // Prepare images, prioritizing secondary images
  const reorderedImages = artwork.all_images?.length
    ? [...artwork.all_images].sort((a, b) => {
        if (a.is_secondary && !b.is_secondary) return -1;
        if (!a.is_secondary && b.is_secondary) return 1;
        return a.position - b.position;
      })
    : [];

  const hasMultipleImages = reorderedImages.length > 1;

  // Carousel navigation
  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();

  // Fullscreen handlers with history integration
  const openFullscreen = (index: number) => {
    setFullscreenIndex(index);
    setIsFullscreen(true);
    setScale(1);
    setPosition({ x: 0, y: 0 });
    // Push a history state for fullscreen so back button closes it
    window.history.pushState({ fullscreen: true }, "");
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Handle browser back button for fullscreen
  useEffect(() => {
    if (!isFullscreen) return;

    const handlePopState = () => {
      closeFullscreen();
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isFullscreen]);

  const navigateFullscreen = (direction: "prev" | "next") => {
    setFullscreenIndex((current) => {
      if (direction === "prev") {
        return current === 0 ? reorderedImages.length - 1 : current - 1;
      } else {
        return current === reorderedImages.length - 1 ? 0 : current + 1;
      }
    });
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Touch/pinch zoom handlers
  const getTouchDistance = (touches: React.TouchList) => {
    const touch1 = touches[0];
    const touch2 = touches[1];
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      setIsPinching(true);
      lastDistance.current = getTouchDistance(e.touches);
      lastScale.current = scale;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && isPinching) {
      e.preventDefault();
      const currentDistance = getTouchDistance(e.touches);
      const scaleChange = currentDistance / lastDistance.current;
      const newScale = Math.min(Math.max(lastScale.current * scaleChange, 1), 4);
      setScale(newScale);
    }
  };

  const handleTouchEnd = () => {
    if (isPinching) {
      setIsPinching(false);
    }
  };


  const isSold = artwork.status === "sold";

  // WhatsApp contact
  const handleWhatsAppClick = () => {
    const phoneNumber = "27825693884";
    const message = `Hi Nico, I'm interested in your painting "${artwork.title}"`;
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  // Messenger contact
  const handleMessengerClick = () => {
    const message = `Hi Nico, I'm interested in "${artwork.title}"`;
    const messengerUrl = `https://m.me/YOUR_PAGE_ID?text=${encodeURIComponent(message)}`;
    window.open(messengerUrl, "_blank");
  };

  // Email contact
  const handleEmailClick = () => {
    const subject = `Enquiry about "${artwork.title}"`;
    const body = `Hi Nico,\n\nI'm interested in your painting "${artwork.title}".\n\nCould you please provide more information?\n\nThank you!`;
    const mailtoUrl = `mailto:nicoburger13@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent
          className={cn(
            "max-w-[1150px] max-h-[95vh] overflow-hidden",
            "rounded-xl shadow-2xl border border-gray-200",
            "p-0"
          )}
          onEscapeKeyDown={(e) => {
            if (isFullscreen) {
              e.preventDefault();
            }
          }}
          onInteractOutside={(e) => {
            if (isFullscreen) {
              e.preventDefault();
            }
          }}
          onPointerDownOutside={(e) => {
            if (isFullscreen) {
              e.preventDefault();
            }
          }}
        >
          {/* Custom close button */}
          <button
            onClick={onClose}
            className={cn(
              "absolute top-4 right-4 z-10",
              "w-10 h-10 rounded-full",
              "flex items-center justify-center",
              "text-muted-foreground hover:text-foreground",
              "hover:bg-gray-100 transition-colors duration-200",
              "focus:outline-none focus:ring-2 focus:ring-primary/50"
            )}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Two-column layout */}
          <div className="grid lg:grid-cols-[1fr_400px] gap-0 max-h-[95vh] overflow-y-auto lg:overflow-visible">
            {/* Left Column - Image Section */}
            <div className="relative bg-stone-50 p-6 flex flex-col items-center justify-center min-h-[350px] md:min-h-[450px] lg:min-h-[600px]">
              {/* Carousel */}
              <div className="w-full overflow-hidden" ref={emblaRef}>
                <div className="flex">
                  {reorderedImages.map((image, index) => (
                    <div key={image.id} className="flex-[0_0_100%] min-w-0 px-2">
                      <div className="relative aspect-[4/3] lg:aspect-square flex items-center justify-center">
                        <img
                          src={image.image_url}
                          alt={image.alt || artwork.title}
                          className="max-w-full max-h-full object-contain cursor-pointer"
                          onClick={() => openFullscreen(index)}
                        />
                        {isSold && (
                          <Badge
                            variant="secondary"
                            className="absolute top-4 left-4 z-10 text-base px-4 py-2 font-bold uppercase tracking-wider shadow-lg"
                          >
                            SOLD
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation arrows */}
              {hasMultipleImages && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      scrollPrev();
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-md flex items-center justify-center transition-colors z-10"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      scrollNext();
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-md flex items-center justify-center transition-colors z-10"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Dot indicators */}
              {hasMultipleImages && (
                <div className="flex gap-3 mt-6">
                  {reorderedImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => emblaApi?.scrollTo(index)}
                      className={cn(
                        "w-3 h-3 rounded-full transition-all duration-200",
                        index === selectedIndex
                          ? "bg-primary scale-110"
                          : "bg-gray-300 hover:bg-gray-400"
                      )}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right Column - Content Section */}
            <div className="p-8 flex flex-col gap-4 lg:overflow-y-auto lg:max-h-[95vh]">
              {/* Title */}
              <h2 className="text-2xl font-semibold font-heading text-foreground pr-8">
                {artwork.title}
              </h2>

              {/* Specs Block */}
              <div className="space-y-2 py-4 border-b border-gray-100">
                {artwork.medium_type && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground w-32">Medium</span>
                    <span className="text-sm font-medium">{artwork.medium_type}</span>
                  </div>
                )}
                {(artwork.height_cm || artwork.width_cm) && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground w-32">Size</span>
                    <span className="text-sm font-medium">
                      {artwork.height_cm && `H${artwork.height_cm}`}
                      {artwork.height_cm && artwork.width_cm && " × "}
                      {artwork.width_cm && `W${artwork.width_cm}`} mm
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground w-32">Frame Included</span>
                  <span className="text-sm font-medium">
                    {artwork.frame_included ? "Yes" : "No"}
                  </span>
                </div>
              </div>

              {/* Description */}
              {artwork.description && (
                <div className="py-4 border-b border-gray-100">
                  <p className="text-muted-foreground leading-relaxed max-w-prose">
                    {artwork.description}
                  </p>
                </div>
              )}

              {/* Price */}
              {artwork.price_zar && !isSold && (
                <div className="py-4">
                  <p className="text-3xl font-bold text-foreground">
                    R {artwork.price_zar.toLocaleString()}
                  </p>
                </div>
              )}

              {/* CTAs Block - Available Paintings */}
              {!isSold && (
                <div className="pt-4 border-t border-gray-200 mt-auto">
                  <p className="text-sm font-medium text-muted-foreground mb-4">
                    Interested in this piece?
                  </p>
                  <div className="flex gap-4 justify-start">
                    <button
                      onClick={handleWhatsAppClick}
                      className="w-12 h-12 rounded-full bg-[hsl(120_20%_68%)] hover:bg-[hsl(120_20%_58%)] text-white flex items-center justify-center transition-colors shadow-md"
                      aria-label="Contact via WhatsApp"
                    >
                      <WhatsAppIcon />
                    </button>
                    <button
                      onClick={handleMessengerClick}
                      className="w-12 h-12 rounded-full bg-[hsl(200_30%_75%)] hover:bg-[hsl(200_30%_65%)] text-white flex items-center justify-center transition-colors shadow-md"
                      aria-label="Contact via Messenger"
                    >
                      <FacebookIcon />
                    </button>
                    <button
                      onClick={handleEmailClick}
                      className="w-12 h-12 rounded-full bg-[hsl(45_75%_65%)] hover:bg-[hsl(45_75%_55%)] text-foreground flex items-center justify-center transition-colors shadow-md"
                      aria-label="Contact via Email"
                    >
                      <Mail className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* CTAs Block - Sold Paintings */}
              {isSold && (
                <div className="pt-4 border-t border-gray-200 mt-auto">
                  <p className="text-sm font-medium text-foreground mb-2">
                    This piece has found its home
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Interested in a similar custom piece? Get in touch with the artist.
                  </p>
                  <div className="flex gap-4 justify-start">
                    <button
                      onClick={handleWhatsAppClick}
                      className="w-12 h-12 rounded-full bg-[hsl(120_20%_68%)] hover:bg-[hsl(120_20%_58%)] text-white flex items-center justify-center transition-colors shadow-md"
                      aria-label="Contact via WhatsApp"
                    >
                      <WhatsAppIcon />
                    </button>
                    <button
                      onClick={handleMessengerClick}
                      className="w-12 h-12 rounded-full bg-[hsl(200_30%_75%)] hover:bg-[hsl(200_30%_65%)] text-white flex items-center justify-center transition-colors shadow-md"
                      aria-label="Contact via Messenger"
                    >
                      <FacebookIcon />
                    </button>
                    <button
                      onClick={handleEmailClick}
                      className="w-12 h-12 rounded-full bg-[hsl(45_75%_65%)] hover:bg-[hsl(45_75%_55%)] text-foreground flex items-center justify-center transition-colors shadow-md"
                      aria-label="Contact via Email"
                    >
                      <Mail className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Fullscreen lightbox */}
      {isFullscreen &&
        createPortal(
          <div
            className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center pointer-events-auto"
            onClick={closeFullscreen}
          >
            {/* Close button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeFullscreen();
              }}
              className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10 pointer-events-auto"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Navigation arrows */}
            {hasMultipleImages && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateFullscreen("prev");
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10 pointer-events-auto"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateFullscreen("next");
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10 pointer-events-auto"
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>
              </>
            )}

            {/* Fullscreen image */}
            <div
              className="relative max-w-[90vw] max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <img
                src={reorderedImages[fullscreenIndex]?.image_url}
                alt={reorderedImages[fullscreenIndex]?.alt || artwork.title}
                className="max-w-full max-h-[90vh] object-contain"
                style={{
                  transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
                  transition: isPinching ? "none" : "transform 0.3s ease",
                }}
              />
            </div>

            {/* Image counter */}
            {hasMultipleImages && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/10 px-4 py-2 rounded-full text-white text-sm">
                {fullscreenIndex + 1} / {reorderedImages.length}
              </div>
            )}
          </div>,
          document.body
        )}
    </>
  );
};

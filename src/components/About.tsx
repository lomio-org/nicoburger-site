import { Button } from "@/components/ui/button";

export const About = () => {
  const scrollToGallery = () => {
    document.getElementById("gallery")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative py-24 px-6 bg-muted/30 overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute inset-0 opacity-[0.08] pointer-events-none">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[hsl(15_50%_70%)] to-transparent"></div>
      </div>
      
      <div className="max-w-4xl mx-auto relative">
        <div className="text-center mb-12 animate-fade-in-up">
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6">
            About the Artist
          </h2>
          <div className="w-20 h-1 bg-primary mx-auto mb-8 rounded-full"></div>
        </div>
        
        <div className="space-y-6 text-center animate-fade-in-up">
          <blockquote className="font-body text-3xl md:text-4xl italic font-light leading-relaxed tracking-wide text-[hsl(var(--artist-sky))]">
            "I've always been drawn to simplicity and colour — painting is how I balance both."
          </blockquote>
          
          <p className="font-body text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            Based in Durbanville, Cape Town, Nico Burger creates contemporary landscapes inspired by the quiet beauty of nature. His signature use of bold, colourful trees and vivid skies brings warmth and serenity into any space.
          </p>

          <div className="pt-8">
            <Button
              size="lg"
              onClick={scrollToGallery}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-heading font-semibold px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
            >
              View Gallery
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

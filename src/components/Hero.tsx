import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import heroBackground from "@/assets/hero-background.png";
export const Hero = () => {
  const scrollToGallery = () => {
    document.getElementById("gallery")?.scrollIntoView({
      behavior: "smooth"
    });
  };
  return <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0" style={{
        backgroundImage: `url(${heroBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center"
      }} />
        <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/0 to-background/0"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center animate-fade-in-up">
        <h1 className="font-heading text-5xl md:text-7xl font-bold text-foreground mb-6 tracking-tight" style={{
        textShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
          Nico Burger Art
        </h1>
        <p className="font-body text-xl md:text-2xl mb-8 max-w-2xl mx-auto leading-relaxed tracking-wide text-gray-200 font-medium">Colour. Simplicity. Quietness.</p>
        
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" onClick={scrollToGallery} variant="sky" className="font-heading font-semibold px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all">
              View Gallery
            </Button>
            <Button size="lg" variant="accent" asChild className="font-heading font-semibold px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all">
              <a href="https://wa.me/27825693884" target="_blank" rel="noopener noreferrer">
                Chat on WhatsApp
              </a>
            </Button>
          </div>
      </div>

      {/* Scroll indicator */}
      <button onClick={scrollToGallery} className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-muted-foreground hover:text-foreground transition-all animate-bounce hover:animate-pulse opacity-0 animate-fade-in-up" style={{
      animationDelay: '1.5s',
      animationFillMode: 'forwards'
    }} aria-label="Scroll to gallery">
        <ChevronDown size={32} />
      </button>
    </section>;
};
import { Link } from "react-router-dom";
import { Settings } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="py-10 px-6 bg-muted/20 border-t border-border/30 relative">
      <div className="max-w-7xl mx-auto">
        <Link 
          to="/admin" 
          className="absolute top-4 right-4 text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors"
          aria-label="Admin"
        >
          <Settings className="w-4 h-4" />
        </Link>
        <div className="text-center space-y-3">
          <p className="font-heading text-3xl font-bold text-foreground tracking-tight">
            Nico Burger Art
          </p>
          <p className="font-body text-sm" style={{ color: 'hsl(220 12% 55%)' }}>
            Durbanville, Cape Town, South Africa
          </p>
          <div className="pt-4 border-t border-border/30 mt-6">
            <p className="font-body text-xs text-muted-foreground/80">
              © 2025 Nico Burger Art — All Rights Reserved
            </p>
            <p className="font-body text-xs text-muted-foreground/70 mt-2">
              Website by{" "}
              <a
                href="https://lomio.co.za"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary/80 hover:underline transition-colors"
              >
                Lomio.co.za
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

import { Button } from "@/components/ui/button";
import { Mail, MessageCircle } from "lucide-react";
import heroBackground from "@/assets/hero-background.png";

export const Contact = () => {
  return (
    <section id="contact" className="relative py-24 px-6 overflow-hidden">
      {/* Blurred background */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${heroBackground})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(40px)",
            transform: "scale(1.1)",
          }}
        />
        <div className="absolute inset-0 bg-background/80"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="text-center mb-12 animate-fade-in-up">
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6">
            Contact & Enquiries
          </h2>
          <div className="w-20 h-1 bg-primary mx-auto mb-8 rounded-full"></div>
        </div>

        <div className="space-y-8 text-center animate-fade-in-up">
          <p className="font-body text-2xl md:text-3xl text-foreground/90 font-light leading-relaxed">
            Interested in a painting or want to ask a question?
          </p>
          <p className="font-body text-xl text-muted-foreground">
            Let's chat — I respond personally to every message.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto pt-8">
            <Button
              size="lg"
              variant="accent"
              asChild
              className="font-heading font-semibold py-8 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              <a
                href="https://wa.me/27825693884"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3"
              >
                <MessageCircle className="w-6 h-6" />
                Chat on WhatsApp
              </a>
            </Button>

            <Button
              size="lg"
              variant="secondary"
              asChild
              className="font-heading font-semibold py-8 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              <a
                href="mailto:ndburger@iafrica.com"
                className="flex items-center gap-3"
              >
                <Mail className="w-6 h-6" />
                Send an Email
              </a>
            </Button>
          </div>

          <div className="pt-8 space-y-2">
            <p className="font-body text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Phone:</span> 082 569 3884
            </p>
            <p className="font-body text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Email:</span> ndburger@iafrica.com
            </p>
            <p className="font-body text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Location:</span> Durbanville, Cape Town, South Africa
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

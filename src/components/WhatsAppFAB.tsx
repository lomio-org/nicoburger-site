import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const WhatsAppFAB = () => {
  return (
    <a
      href="https://wa.me/27825693884"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 md:hidden"
      aria-label="Chat on WhatsApp"
    >
      <Button
        size="lg"
        className="h-16 w-16 rounded-full bg-[#25D366] hover:bg-[#20BA5A] text-white shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110"
      >
        <MessageCircle className="h-7 w-7" />
      </Button>
    </a>
  );
};

import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Gallery } from "@/components/Gallery";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { WhatsAppFAB } from "@/components/WhatsAppFAB";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <About />
      <Gallery />
      <Contact />
      <Footer />
      <WhatsAppFAB />
    </div>
  );
};

export default Index;

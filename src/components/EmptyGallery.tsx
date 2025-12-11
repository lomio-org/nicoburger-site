export const EmptyGallery = () => {
  return (
    <section id="gallery" className="py-24 px-6">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="font-heading text-4xl md:text-5xl font-bold mb-6 text-foreground">
          Gallery
        </h2>
        <p className="text-muted-foreground text-lg mb-8">
          No paintings available yet. Check back soon!
        </p>
      </div>
    </section>
  );
};

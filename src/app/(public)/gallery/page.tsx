import dbConnect from "@/lib/dbConnect";
import Gallery from "@/models/Gallery";
import GalleryView from "@/components/GalleryView";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  await dbConnect();
  
  // Fetch active gallery items
  const galleryItems = await Gallery.find({ isActive: true }).sort({ order: 1, createdAt: -1 }).lean();

  // Map to structured items
  const items = galleryItems.map((item: any) => ({
    _id: item._id.toString(),
    title: item.title,
    imageUrl: item.imageUrl,
    category: item.category || "General",
  }));

  return (
    <div className="py-20 bg-bg text-text">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="primary" className="mb-3">Academy Media</Badge>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold mb-4">
            Our Campus & Events Gallery
          </h1>
          <p className="text-lg text-text/70">
            A visual overview of campus facilities, classroom environments, test halls, and ceremony events.
          </p>
        </div>

        {/* Gallery Interactive Component */}
        <GalleryView items={items} />

      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Image as ImageIcon, X, Expand } from "lucide-react";
import { Card } from "@/components/ui/Card";

interface GalleryItem {
  _id: string;
  title: string;
  imageUrl: string;
  category: string;
}

export function GalleryView({ items }: { items: GalleryItem[] }) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeImage, setActiveImage] = useState<GalleryItem | null>(null);

  // Extract unique categories
  const categories = ["All", ...Array.from(new Set(items.map((item) => item.category)))];

  // Filter items
  const filteredItems =
    selectedCategory === "All"
      ? items
      : items.filter((item) => item.category === selectedCategory);

  return (
    <div className="space-y-12">
      {/* Category Filter Pills */}
      {categories.length > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 text-sm font-medium rounded-full border transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-primary text-white border-primary shadow-md"
                  : "bg-surface text-text/70 border-border hover:text-primary hover:border-primary/30"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Grid Display */}
      {filteredItems.length > 0 ? (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item) => (
              <motion.div
                layout
                key={item._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <Card
                  hoverLift={true}
                  clickable={true}
                  onClick={() => setActiveImage(item)}
                  className="group relative !p-0 aspect-square overflow-hidden border border-border"
                >
                  {/* Image container */}
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-w-768px) 100vw, (max-w-1200px) 50vw, 33vw"
                  />

                  {/* Dark hover mask */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 text-white">
                    <Expand className="absolute top-4 right-4 w-5 h-5 text-white/70" />
                    <span className="text-xs uppercase tracking-wider text-secondary font-semibold mb-1">
                      {item.category}
                    </span>
                    <h4 className="font-serif text-lg font-bold truncate">
                      {item.title}
                    </h4>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="text-center py-20 border border-dashed border-border rounded-2xl bg-surface">
          <ImageIcon className="w-16 h-16 text-text/20 mx-auto mb-4" />
          <h3 className="font-serif text-xl font-bold mb-2">No Gallery Media</h3>
          <p className="text-sm text-text/60">
            Admins haven't uploaded images to the gallery yet. Check back soon!
          </p>
        </div>
      )}

      {/* Lightbox Overlay */}
      <AnimatePresence>
        {activeImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveImage(null)}
              className="fixed inset-0 bg-black/90 cursor-pointer"
            />

            {/* Content panel */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl max-h-[85vh] w-full z-10 flex flex-col items-center"
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveImage(null)}
                className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full cursor-pointer focus:outline-none"
                aria-label="Close Lightbox"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Lightbox Image */}
              <div className="relative w-full aspect-video md:aspect-[4/3] rounded-lg overflow-hidden border border-white/10 shadow-2xl bg-black">
                <Image
                  src={activeImage.imageUrl}
                  alt={activeImage.title}
                  fill
                  className="object-contain"
                  sizes="100vw"
                  priority
                />
              </div>

              {/* Text label */}
              <div className="mt-4 text-center text-white">
                <span className="text-xs uppercase tracking-wider text-secondary font-semibold">
                  {activeImage.category}
                </span>
                <h4 className="font-serif text-xl font-bold mt-1">
                  {activeImage.title}
                </h4>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
export default GalleryView;

import mongoose, { Schema } from "mongoose";

const GallerySchema = new Schema(
  {
    title: { type: String, required: true },
    imageUrl: { type: String, required: true },
    category: { type: String, default: "General" }, // e.g. "Campus", "Events", "Classrooms"
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Gallery || mongoose.model("Gallery", GallerySchema);

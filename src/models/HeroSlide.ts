import mongoose, { Schema } from "mongoose";

const HeroSlideSchema = new Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String, default: "" },
    imageUrl: { type: String, required: true },
    buttonText: { type: String, default: "Learn More" },
    buttonLink: { type: String, default: "#" },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.HeroSlide || mongoose.model("HeroSlide", HeroSlideSchema);

import mongoose, { Schema } from "mongoose";

const WallOfHonorSchema = new Schema(
  {
    studentName: { type: String, required: true },
    scoreText: { type: String, required: true }, // e.g. "A+ Grade (95% in Board)" or "MCAT 195/200"
    achievementYear: { type: String, required: true }, // e.g. "2025"
    details: { type: String, default: "" },
    imageUrl: { type: String, default: "/brand/placeholder.jpg" },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.WallOfHonor || mongoose.model("WallOfHonor", WallOfHonorSchema);

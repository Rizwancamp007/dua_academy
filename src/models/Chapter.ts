import mongoose, { Schema } from "mongoose";

const ChapterSchema = new Schema(
  {
    name: { type: String, required: true },
    subjectRef: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
    order: { type: Number, default: 0 },
    description: { type: String },
  },
  { timestamps: true }
);

// Prevent duplicate chapter names in the same subject
ChapterSchema.index({ name: 1, subjectRef: 1 }, { unique: true });

export default mongoose.models.Chapter || mongoose.model("Chapter", ChapterSchema);

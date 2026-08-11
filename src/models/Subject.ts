import mongoose, { Schema } from "mongoose";

const SubjectSchema = new Schema(
  {
    name: { type: String, required: true },
    classRef: { type: Schema.Types.ObjectId, ref: "Class", required: true },
    description: { type: String },
  },
  { timestamps: true }
);

// Prevent duplicate subject names in the same class
SubjectSchema.index({ name: 1, classRef: 1 }, { unique: true });

export default mongoose.models.Subject || mongoose.model("Subject", SubjectSchema);

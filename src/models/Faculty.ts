import mongoose, { Schema } from "mongoose";

const FacultySchema = new Schema(
  {
    name: { type: String, required: true },
    subject: { type: String, required: true },
    qualification: { type: String, required: true },
    experience: { type: String, required: true },
    imageUrl: { type: String, default: "/brand/placeholder.jpg" },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Faculty || mongoose.model("Faculty", FacultySchema);

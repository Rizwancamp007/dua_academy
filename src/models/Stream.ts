import mongoose, { Schema } from "mongoose";

const StreamSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Stream || mongoose.model("Stream", StreamSchema);

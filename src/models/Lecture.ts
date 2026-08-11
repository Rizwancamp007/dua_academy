import mongoose, { Schema } from "mongoose";

const LectureSchema = new Schema(
  {
    title: { type: String, required: true },
    classRef: { type: Schema.Types.ObjectId, ref: "Class", required: true },
    streamRef: { type: Schema.Types.ObjectId, ref: "Stream" },
    subjectRef: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
    sourceType: {
      type: String,
      enum: ["youtube", "drive", "mega"],
      required: true,
    },
    url: { type: String, required: true },
    isPublicDemo: { type: Boolean, default: false },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Lecture || mongoose.model("Lecture", LectureSchema);

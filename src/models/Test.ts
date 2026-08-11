import mongoose, { Schema } from "mongoose";

const TestSchema = new Schema(
  {
    title: { type: String, required: true },
    classRef: { type: Schema.Types.ObjectId, ref: "Class", required: true },
    streamRef: { type: Schema.Types.ObjectId, ref: "Stream" },
    subjectRef: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
    mode: {
      type: String,
      enum: ["timed", "practice", "both"],
      default: "both",
    },
    durationMinutes: { type: Number, required: true, default: 30 },
    mcqRefs: [{ type: Schema.Types.ObjectId, ref: "MCQ" }],
    startTime: { type: Date },
    endTime: { type: Date },
    showAnswersAtEnd: { type: Boolean, default: true },
    isPublished: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Test || mongoose.model("Test", TestSchema);

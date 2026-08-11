import mongoose, { Schema } from "mongoose";

const MCQSchema = new Schema(
  {
    question: { type: String, required: true },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: function (val: string[]) {
          return val.length === 4;
        },
        message: "MCQ must have exactly 4 options.",
      },
    },
    correctIndex: {
      type: Number,
      required: true,
      min: 0,
      max: 3,
    },
    explanation: { type: String, default: "" },
    classRef: { type: Schema.Types.ObjectId, ref: "Class", required: true },
    streamRef: { type: Schema.Types.ObjectId, ref: "Stream" },
    subjectRef: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
    chapterRef: { type: Schema.Types.ObjectId, ref: "Chapter" },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["pending_review", "published", "archived"],
      default: "published",
    },
    sourceDoc: { type: String, default: "" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.models.MCQ || mongoose.model("MCQ", MCQSchema);

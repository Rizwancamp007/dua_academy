import mongoose, { Schema } from "mongoose";

const AnswerSchema = new Schema({
  mcqId: { type: Schema.Types.ObjectId, ref: "MCQ", required: true },
  selectedIndex: { type: Number, min: -1, max: 3 },
  correct: { type: Boolean, required: true },
  timeTakenSec: { type: Number, default: 0 },
});

const AttemptSchema = new Schema(
  {
    studentRef: { type: Schema.Types.ObjectId, ref: "User", required: true },
    testRef: { type: Schema.Types.ObjectId, ref: "Test", required: true },
    answers: [AnswerSchema],
    mode: { type: String, enum: ["timed", "practice"], required: true },
    score: { type: Number, required: true, default: 0 },
    totalQuestions: { type: Number, required: true, default: 0 },
    percentage: { type: Number, required: true, default: 0 },
    tabSwitches: { type: Number, default: 0 },
    autoSubmitted: { type: Boolean, default: false },
    durationSeconds: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Attempt || mongoose.model("Attempt", AttemptSchema);

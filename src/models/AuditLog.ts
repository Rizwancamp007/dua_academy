import mongoose, { Schema } from "mongoose";

const AuditLogSchema = new Schema(
  {
    actorRef: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true }, // e.g. "ROLE_CHANGE", "MCQ_DELETE", "TEST_DELETE"
    target: { type: String, required: true }, // e.g. "User: student@domain.com", "MCQ: ID"
    before: { type: Schema.Types.Mixed },
    after: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export default mongoose.models.AuditLog || mongoose.model("AuditLog", AuditLogSchema);

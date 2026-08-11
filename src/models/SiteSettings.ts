import mongoose, { Schema } from "mongoose";

const SiteSettingsSchema = new Schema(
  {
    commenceDate: { type: String, default: "September 1, 2026" },
    classTimings: { type: String, default: "03:00 PM - 07:00 PM" },
    admissionsOpen: { type: Boolean, default: true },
    whatsappNumber: { type: String, default: "0333-5524440" },
    address: { type: String, default: "Ikhlas Model High School, Mirpur Mathelo" },
  },
  { timestamps: true }
);

export default mongoose.models.SiteSettings || mongoose.model("SiteSettings", SiteSettingsSchema);

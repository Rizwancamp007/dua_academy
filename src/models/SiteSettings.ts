import mongoose, { Schema } from "mongoose";

const SiteSettingsSchema = new Schema(
  {
    commenceDate: { type: String, default: "September 1, 2026" },
    classTimings: { type: String, default: "03:00 PM - 07:00 PM" },
    admissionsOpen: { type: Boolean, default: true },
    whatsappNumber: { type: String, default: "0333-5524440" },
    address: { type: String, default: "Ikhlas Model High School, Mirpur Mathelo" },
    directorName: { type: String, default: "Sir Rizwan Khan" },
    directorTitle: { type: String, default: "Founder & Managing Director" },
    directorMessage: {
      type: String,
      default:
        "Welcome to Duaa Academy. For over two decades, our mission has been to deliver conceptual clarity, structured test pacing, and academic confidence to matric, intermediate, and competitive test candidates in Mirpur Mathelo.",
    },
    directorImage: { type: String, default: "/brand/placeholder.jpg" },
  },
  { timestamps: true }
);

export default mongoose.models.SiteSettings || mongoose.model("SiteSettings", SiteSettingsSchema);

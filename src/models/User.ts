import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["public", "student", "clerk", "teacher", "admin"],
      default: "public",
    },
    isApproved: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    loginAttempts: { type: Number, required: true, default: 0 },
    lockUntil: { type: Date },
    studentDetails: {
      fatherName: { type: String },
      city: { type: String },
      classRef: { type: Schema.Types.ObjectId, ref: "Class" },
      streamRef: { type: Schema.Types.ObjectId, ref: "Stream" },
    },
    teacherDetails: {
      subject: { type: String },
      qualification: { type: String },
      experience: { type: String },
    },
  },
  { timestamps: true }
);

// Strip password when converting to JSON or Object
UserSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete (ret as any).password;
    return ret;
  },
});

UserSchema.set("toObject", {
  transform: (doc, ret) => {
    delete (ret as any).password;
    return ret;
  },
});

export default mongoose.models.User || mongoose.model("User", UserSchema);

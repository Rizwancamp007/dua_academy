import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { secureRouteHandler } from "@/lib/security";
import { z } from "zod";

const settingsSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  fatherName: z.string().min(2, "Father's name is required"),
  city: z.string().min(2, "City is required"),
  currentPassword: z.string().optional().or(z.literal("")),
  newPassword: z.string().optional().or(z.literal("")),
  confirmPassword: z.string().optional().or(z.literal("")),
});

export async function PUT(req: NextRequest) {
  // Authorize student role
  const security = await secureRouteHandler(req, {
    allowedRoles: ["student", "clerk", "teacher", "admin"],
    schema: settingsSchema,
  });

  if (!security.authorized || !security.data || !security.user) {
    return security.response || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();

    const { name, phone, fatherName, city, currentPassword, newPassword, confirmPassword } = security.data;
    const userId = (security.user as any).id;

    // Fetch user with password
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // If attempting to change password
    if (newPassword && newPassword.trim() !== "") {
      if (!currentPassword) {
        return NextResponse.json({ error: "Current password is required to change password." }, { status: 400 });
      }
      if (newPassword !== confirmPassword) {
        return NextResponse.json({ error: "New passwords do not match." }, { status: 400 });
      }
      if (newPassword.length < 6) {
        return NextResponse.json({ error: "New password must be at least 6 characters." }, { status: 400 });
      }

      // Check current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return NextResponse.json({ error: "Incorrect current password." }, { status: 400 });
      }

      // Hash and set new password
      user.password = await bcrypt.hash(newPassword, 12);
    }

    // Update profile fields
    user.name = name;
    user.phone = phone;
    if (!user.studentDetails) {
      user.studentDetails = {} as any;
    }
    user.studentDetails.fatherName = fatherName;
    user.studentDetails.city = city;

    await user.save();

    return NextResponse.json(
      { success: true, message: "Profile settings updated successfully." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Settings update error:", error);
    return NextResponse.json(
      { error: "Internal server error updating settings." },
      { status: 500 }
    );
  }
}

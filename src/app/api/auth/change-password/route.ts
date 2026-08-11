import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { secureRouteHandler } from "@/lib/security";
import { z } from "zod";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

export async function POST(req: NextRequest) {
  const security = await secureRouteHandler(req, {
    allowedRoles: ["admin", "clerk", "teacher", "student"],
    schema: changePasswordSchema,
  });

  if (!security.authorized || !security.data || !security.user) {
    return security.response || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const { currentPassword, newPassword } = security.data;
    const userId = (security.user as any).id;

    // Fetch user with password field
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: "Incorrect current password" }, { status: 400 });
    }

    // Hash and save new password
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error: any) {
    console.error("Change Password Error:", error);
    return NextResponse.json({ error: "Internal Server Error changing password" }, { status: 500 });
  }
}

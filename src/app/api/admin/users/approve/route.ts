import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { secureRouteHandler } from "@/lib/security";
import { z } from "zod";

const approveSchema = z.object({
  userId: z.string().min(1),
  isApproved: z.boolean(),
});

export async function PUT(req: NextRequest) {
  // Authorize clerk or admin roles
  const security = await secureRouteHandler(req, {
    allowedRoles: ["admin", "clerk"],
    schema: approveSchema,
  });

  if (!security.authorized || !security.data) {
    return security.response || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();

    const { userId, isApproved } = security.data;

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "Student account not found." }, { status: 404 });
    }

    if (user.role !== "student") {
      return NextResponse.json(
        { error: "Only student roles can be processed for approvals." },
        { status: 400 }
      );
    }

    user.isApproved = isApproved;
    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: `Student account ${isApproved ? "approved" : "declined"} successfully.`,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Student approval API error:", error);
    return NextResponse.json(
      { error: "Internal server error updating student approval status." },
      { status: 500 }
    );
  }
}

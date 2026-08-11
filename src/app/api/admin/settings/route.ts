import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import SiteSettings from "@/models/SiteSettings";
import User from "@/models/User";
import { secureRouteHandler } from "@/lib/security";
import { z } from "zod";

const settingsPutSchema = z.object({
  commenceDate: z.string().min(1, "Commence date is required"),
  classTimings: z.string().min(1, "Class timings are required"),
  admissionsOpen: z.boolean(),
  whatsappNumber: z.string().min(5, "WhatsApp number is required"),
  address: z.string().min(5, "Address is required"),
});

const rolePatchSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  role: z.enum(["student", "clerk", "teacher", "admin"]),
});

// GET: Fetch global settings
export async function GET(req: NextRequest) {
  const security = await secureRouteHandler(req, {
    allowedRoles: ["admin", "clerk", "teacher"],
  });

  if (!security.authorized) {
    return security.response || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = await SiteSettings.create({});
    }
    return NextResponse.json({ settings });
  } catch (error: any) {
    console.error("Fetch SiteSettings Error:", error);
    return NextResponse.json({ error: "Internal Server Error fetching settings" }, { status: 500 });
  }
}

// PUT: Save global settings
export async function PUT(req: NextRequest) {
  const security = await secureRouteHandler(req, {
    allowedRoles: ["admin", "clerk", "teacher"],
    schema: settingsPutSchema,
  });

  if (!security.authorized || !security.data) {
    return security.response || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const { commenceDate, classTimings, admissionsOpen, whatsappNumber, address } = security.data;

    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = new SiteSettings();
    }

    settings.commenceDate = commenceDate;
    settings.classTimings = classTimings;
    settings.admissionsOpen = admissionsOpen;
    settings.whatsappNumber = whatsappNumber;
    settings.address = address;

    await settings.save();

    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    console.error("Save SiteSettings Error:", error);
    return NextResponse.json({ error: "Internal Server Error saving settings" }, { status: 500 });
  }
}

// PATCH: Promote/Demote User Roles (ADMIN ONLY)
export async function PATCH(req: NextRequest) {
  // STRICT BOUNDARY: ONLY allow "admin" (super admin) to change user roles
  const security = await secureRouteHandler(req, {
    allowedRoles: ["admin"],
    schema: rolePatchSchema,
  });

  if (!security.authorized || !security.data || !security.user) {
    return security.response || NextResponse.json({ error: "Unauthorized. Admin role required." }, { status: 403 });
  }

  try {
    await dbConnect();
    const { userId, role } = security.data;
    const currentAdminId = (security.user as any).id;

    // Prevent admin from demoting themselves
    if (userId === currentAdminId) {
      return NextResponse.json({ error: "You cannot change your own role." }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const previousRole = user.role;
    user.role = role;
    await user.save();

    // Log the event (Audit Log)
    console.log(`[AUDIT LOG] Admin (ID: ${currentAdminId}) changed role of User (ID: ${userId}) from ${previousRole} to ${role}.`);

    return NextResponse.json({
      success: true,
      message: `User ${user.name} successfully updated to role: ${role}`,
    });
  } catch (error: any) {
    console.error("User Role Patch Error:", error);
    return NextResponse.json({ error: "Internal Server Error promoting user" }, { status: 500 });
  }
}

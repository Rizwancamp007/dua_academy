import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { secureRouteHandler } from "@/lib/security";

import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  // Only allow admin roles to lookup users for promotions
  const security = await secureRouteHandler(req, {
    allowedRoles: ["admin"],
  });

  if (!security.authorized) {
    return security.response || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const url = new URL(req.url);
    const searchTerm = url.searchParams.get("email") || "";

    if (!searchTerm || searchTerm.length < 3) {
      return NextResponse.json({ users: [] });
    }

    const query: any = {};
    if (mongoose.Types.ObjectId.isValid(searchTerm)) {
      query._id = searchTerm;
    } else {
      query.$or = [
        { email: { $regex: searchTerm, $options: "i" } },
        { name: { $regex: searchTerm, $options: "i" } },
      ];
    }

    const users = await User.find(query)
      .limit(10)
      .select("name email role")
      .lean();

    const formatted = users.map((u: any) => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      role: u.role,
    }));

    return NextResponse.json({ users: formatted });
  } catch (error: any) {
    console.error("User Search Error:", error);
    return NextResponse.json({ error: "Internal Server Error searching users" }, { status: 500 });
  }
}

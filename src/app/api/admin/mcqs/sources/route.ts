import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import MCQ from "@/models/MCQ";
import { secureRouteHandler } from "@/lib/security";

export async function GET(req: NextRequest) {
  const security = await secureRouteHandler(req, {
    allowedRoles: ["admin", "clerk", "teacher"],
  });

  if (!security.authorized) {
    return security.response || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    // Retrieve all distinct sourceDoc values from MCQ collection
    const sources = await MCQ.distinct("sourceDoc");
    const filteredSources = sources.filter((s) => s && s.trim().length > 0);
    return NextResponse.json({ sources: filteredSources });
  } catch (error: any) {
    console.error("Fetch distinct sources error:", error);
    return NextResponse.json({ error: "Failed to fetch distinct sources" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const security = await secureRouteHandler(req, {
    allowedRoles: ["admin", "clerk", "teacher"],
  });

  if (!security.authorized) {
    return security.response || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const { oldName, newName } = await req.json();
    if (!oldName || !newName) {
      return NextResponse.json({ error: "oldName and newName are required" }, { status: 400 });
    }

    const result = await MCQ.updateMany({ sourceDoc: oldName }, { sourceDoc: newName });
    return NextResponse.json({ success: true, modifiedCount: result.modifiedCount });
  } catch (error: any) {
    console.error("Rename source error:", error);
    return NextResponse.json({ error: "Failed to rename source document" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const security = await secureRouteHandler(req, {
    allowedRoles: ["admin", "clerk", "teacher"],
  });

  if (!security.authorized) {
    return security.response || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const url = new URL(req.url);
    const sourceName = url.searchParams.get("sourceName");
    if (!sourceName) {
      return NextResponse.json({ error: "sourceName is required" }, { status: 400 });
    }

    const result = await MCQ.deleteMany({ sourceDoc: sourceName });
    return NextResponse.json({ success: true, deletedCount: result.deletedCount });
  } catch (error: any) {
    console.error("Delete source error:", error);
    return NextResponse.json({ error: "Failed to delete source document" }, { status: 500 });
  }
}

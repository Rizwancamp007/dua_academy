import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { secureRouteHandler } from "@/lib/security";
import Faculty from "@/models/Faculty";
import WallOfHonor from "@/models/WallOfHonor";
import Gallery from "@/models/Gallery";
import HeroSlide from "@/models/HeroSlide";
import Lecture from "@/models/Lecture";

export const dynamic = "force-dynamic";

function getModel(type: string) {
  switch (type) {
    case "faculty":
      return Faculty;
    case "honor":
      return WallOfHonor;
    case "gallery":
      return Gallery;
    case "hero":
      return HeroSlide;
    case "lecture":
      return Lecture;
    default:
      return null;
  }
}

export async function GET(req: NextRequest) {
  const security = await secureRouteHandler(req, {
    allowedRoles: ["admin", "clerk", "teacher"],
  });

  if (!security.authorized) {
    return security.response || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "";
  const model = getModel(type);

  if (!model) {
    return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 });
  }

  try {
    await dbConnect();
    let data;
    if (type === "lecture") {
      data = await Lecture.find()
        .populate("classRef", "name")
        .populate("streamRef", "name")
        .populate("subjectRef", "name")
        .sort({ createdAt: -1 })
        .lean();
    } else {
      data = await model.find().sort({ order: 1, createdAt: -1 }).lean();
    }
    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch content data" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const security = await secureRouteHandler(req, {
    allowedRoles: ["admin", "clerk"],
  });

  if (!security.authorized) {
    return security.response || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "";
  const model = getModel(type);

  if (!model) {
    return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 });
  }

  try {
    const body = await req.json();
    await dbConnect();

    if (type === "lecture") {
      body.uploadedBy = (security as any).user?.id || body.uploadedBy;
    }

    const created = await model.create(body);
    return NextResponse.json({ item: created });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create content item" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const security = await secureRouteHandler(req, {
    allowedRoles: ["admin", "clerk"],
  });

  if (!security.authorized) {
    return security.response || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "";
  const model = getModel(type);

  if (!model) {
    return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { _id, ...updateData } = body;

    if (!_id) {
      return NextResponse.json({ error: "Missing item identifier (_id)" }, { status: 400 });
    }

    await dbConnect();
    const updated = await model.findByIdAndUpdate(_id, { $set: updateData }, { new: true });

    if (!updated) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ item: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update content item" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const security = await secureRouteHandler(req, {
    allowedRoles: ["admin", "clerk"],
  });

  if (!security.authorized) {
    return security.response || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "";
  const id = searchParams.get("id") || "";
  const model = getModel(type);

  if (!model || !id) {
    return NextResponse.json({ error: "Invalid type or id parameter" }, { status: 400 });
  }

  try {
    await dbConnect();
    const deleted = await model.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete item" }, { status: 500 });
  }
}

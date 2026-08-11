import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Test from "@/models/Test";
import { secureRouteHandler } from "@/lib/security";
import { z } from "zod";

const testFormSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2, "Title is too short"),
  classRef: z.string().min(1, "Class is required"),
  streamRef: z.string().optional().nullable().or(z.literal("")),
  subjectRef: z.string().min(1, "Subject is required"),
  durationMinutes: z.number().int().min(1, "Duration must be at least 1 minute"),
  mode: z.enum(["timed", "practice", "both"]).default("both"),
  isPublished: z.boolean().default(false),
  mcqRefs: z.array(z.string()).min(1, "At least 1 question must be added to the test"),
  showAnswersAtEnd: z.boolean().default(true),
  startTime: z.string().optional().nullable().or(z.literal("")),
  endTime: z.string().optional().nullable().or(z.literal("")),
});

// GET: List tests
export async function GET(req: NextRequest) {
  const security = await secureRouteHandler(req, {
    allowedRoles: ["admin", "clerk", "teacher"],
  });

  if (!security.authorized) {
    return security.response || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const url = new URL(req.url);
    const classFilter = url.searchParams.get("classRef") || "";
    const subjectFilter = url.searchParams.get("subjectRef") || "";

    const query: any = {};
    if (classFilter) query.classRef = classFilter;
    if (subjectFilter) query.subjectRef = subjectFilter;

    const tests = await Test.find(query)
      .populate("classRef", "name")
      .populate("streamRef", "name")
      .populate("subjectRef", "name")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ tests });
  } catch (error: any) {
    console.error("Test List Fetch Error:", error);
    return NextResponse.json({ error: "Internal Server Error fetching Tests" }, { status: 500 });
  }
}

// POST: Create test
export async function POST(req: NextRequest) {
  const security = await secureRouteHandler(req, {
    allowedRoles: ["admin", "clerk", "teacher"],
    schema: testFormSchema,
  });

  if (!security.authorized || !security.data || !security.user) {
    return security.response || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const { title, classRef, streamRef, subjectRef, durationMinutes, mode, isPublished, mcqRefs, showAnswersAtEnd, startTime, endTime } = security.data;
    const userId = (security.user as any).id;

    const newTest = await Test.create({
      title,
      classRef,
      streamRef: streamRef || undefined,
      subjectRef,
      durationMinutes,
      mode,
      isPublished,
      mcqRefs,
      showAnswersAtEnd,
      startTime: startTime ? new Date(startTime) : undefined,
      endTime: endTime ? new Date(endTime) : undefined,
      createdBy: userId,
    });

    return NextResponse.json({ success: true, test: newTest }, { status: 201 });
  } catch (error: any) {
    console.error("Test Create Error:", error);
    return NextResponse.json({ error: "Internal Server Error creating Test" }, { status: 500 });
  }
}

// PUT: Update test details or publish state
export async function PUT(req: NextRequest) {
  const security = await secureRouteHandler(req, {
    allowedRoles: ["admin", "clerk", "teacher"],
    schema: testFormSchema,
  });

  if (!security.authorized || !security.data) {
    return security.response || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const { id, title, classRef, streamRef, subjectRef, durationMinutes, mode, isPublished, mcqRefs, showAnswersAtEnd, startTime, endTime } = security.data;

    if (!id) {
      return NextResponse.json({ error: "Test ID is required" }, { status: 400 });
    }

    const updatedTest = await Test.findByIdAndUpdate(
      id,
      {
        title,
        classRef,
        streamRef: streamRef || undefined,
        subjectRef,
        durationMinutes,
        mode,
        isPublished,
        mcqRefs,
        showAnswersAtEnd,
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined,
      },
      { new: true }
    );

    if (!updatedTest) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, test: updatedTest });
  } catch (error: any) {
    console.error("Test Update Error:", error);
    return NextResponse.json({ error: "Internal Server Error updating Test" }, { status: 500 });
  }
}

// DELETE: Remove test
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
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Test ID is required" }, { status: 400 });
    }

    const deletedTest = await Test.findByIdAndDelete(id);
    if (!deletedTest) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Test deleted successfully" });
  } catch (error: any) {
    console.error("Test Delete Error:", error);
    return NextResponse.json({ error: "Internal Server Error deleting Test" }, { status: 500 });
  }
}

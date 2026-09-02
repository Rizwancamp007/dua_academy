import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import MCQ from "@/models/MCQ";
import Class from "@/models/Class";
import Stream from "@/models/Stream";
import Subject from "@/models/Subject";
import { secureRouteHandler } from "@/lib/security";
import { z } from "zod";

const mcqFormSchema = z.object({
  id: z.string().optional(),
  question: z.string().min(2, "Question is too short"),
  questionImage: z.string().optional().default(""),
  options: z.array(z.string().min(1, "Option cannot be empty")).length(4, "Exactly 4 options are required"),
  correctIndex: z.number().int().min(0).max(3, "Correct option index must be between 0 and 3"),
  explanation: z.string().optional().default(""),
  classRef: z.string().min(1, "Class is required"),
  streamRef: z.string().optional().nullable().or(z.literal("")),
  subjectRef: z.string().min(1, "Subject is required"),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
  status: z.enum(["pending_review", "published", "archived"]).default("published"),
});

// GET: Retrieve paginated MCQs with filters
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
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const search = url.searchParams.get("search") || "";
    const classFilter = url.searchParams.get("classRef") || "";
    const streamFilter = url.searchParams.get("streamRef") || "";
    const subjectFilter = url.searchParams.get("subjectRef") || "";
    const sourceFilter = url.searchParams.get("source") || "";

    const limitParam = url.searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : 50;
    const skip = (page - 1) * limit;

    const query: any = {};

    // Apply search filter on question text
    if (search) {
      query.question = { $regex: search, $options: "i" };
    }

    // Apply exact matches for object ids
    if (classFilter) query.classRef = classFilter;
    if (streamFilter) query.streamRef = streamFilter;
    if (subjectFilter) query.subjectRef = subjectFilter;

    // Apply source filter
    if (sourceFilter) {
      if (sourceFilter.toLowerCase() === "ai") {
        query.sourceDoc = { $regex: "^AI:" };
      } else if (sourceFilter.toLowerCase() === "manual") {
        query.sourceDoc = { $in: ["", "Manual", null] };
      } else {
        query.sourceDoc = sourceFilter;
      }
    }

    // Run parallel count and fetch
    const [mcqs, totalCount] = await Promise.all([
      MCQ.find(query)
        .populate("classRef", "name")
        .populate("streamRef", "name")
        .populate("subjectRef", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      MCQ.countDocuments(query),
    ]);

    return NextResponse.json({
      mcqs,
      totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error: any) {
    console.error("MCQ List Fetch Error:", error);
    return NextResponse.json({ error: "Internal Server Error fetching MCQs" }, { status: 500 });
  }
}

// POST: Create a single MCQ
export async function POST(req: NextRequest) {
  const security = await secureRouteHandler(req, {
    allowedRoles: ["admin", "clerk", "teacher"],
    schema: mcqFormSchema,
  });

  if (!security.authorized || !security.data || !security.user) {
    return security.response || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const { question, questionImage, options, correctIndex, explanation, classRef, streamRef, subjectRef, difficulty, status } = security.data;
    const userId = (security.user as any).id;

    const newMcq = await MCQ.create({
      question,
      questionImage,
      options,
      correctIndex,
      explanation,
      classRef,
      streamRef: streamRef || undefined,
      subjectRef,
      difficulty,
      status,
      createdBy: userId,
    });

    return NextResponse.json({ success: true, mcq: newMcq }, { status: 201 });
  } catch (error: any) {
    console.error("MCQ Create Error:", error);
    return NextResponse.json({ error: "Internal Server Error creating MCQ" }, { status: 500 });
  }
}

// PUT: Update an MCQ
export async function PUT(req: NextRequest) {
  const security = await secureRouteHandler(req, {
    allowedRoles: ["admin", "clerk", "teacher"],
    schema: mcqFormSchema,
  });

  if (!security.authorized || !security.data) {
    return security.response || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const { id, question, questionImage, options, correctIndex, explanation, classRef, streamRef, subjectRef, difficulty, status } = security.data;

    if (!id) {
      return NextResponse.json({ error: "MCQ ID is required for updates" }, { status: 400 });
    }

    const updatedMcq = await MCQ.findByIdAndUpdate(
      id,
      {
        question,
        questionImage,
        options,
        correctIndex,
        explanation,
        classRef,
        streamRef: streamRef || undefined,
        subjectRef,
        difficulty,
        status,
      },
      { new: true }
    );

    if (!updatedMcq) {
      return NextResponse.json({ error: "MCQ not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, mcq: updatedMcq });
  } catch (error: any) {
    console.error("MCQ Update Error:", error);
    return NextResponse.json({ error: "Internal Server Error updating MCQ" }, { status: 500 });
  }
}

// DELETE: Remove an MCQ
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
      return NextResponse.json({ error: "MCQ ID is required" }, { status: 400 });
    }

    const deletedMcq = await MCQ.findByIdAndDelete(id);
    if (!deletedMcq) {
      return NextResponse.json({ error: "MCQ not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "MCQ deleted successfully" });
  } catch (error: any) {
    console.error("MCQ Delete Error:", error);
    return NextResponse.json({ error: "Internal Server Error deleting MCQ" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import MCQ from "@/models/MCQ";
import { secureRouteHandler } from "@/lib/security";
import { z } from "zod";

const saveBatchSchema = z.object({
  classRef: z.string().min(1, "Class is required"),
  streamRef: z.string().optional().nullable().or(z.literal("")),
  subjectRef: z.string().min(1, "Subject is required"),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
  sourceDoc: z.string().optional().default(""),
  mcqs: z.array(
    z.object({
      question: z.string().min(2, "Question statement is required"),
      options: z.array(z.string().min(1)).length(4, "Exactly 4 options are required"),
      correctIndex: z.number().int().min(0).max(3),
      explanation: z.string().optional().default(""),
    })
  ).min(1, "No questions to save"),
});

export async function POST(req: NextRequest) {
  const security = await secureRouteHandler(req, {
    allowedRoles: ["admin", "clerk", "teacher"],
    schema: saveBatchSchema,
  });

  if (!security.authorized || !security.data || !security.user) {
    return security.response || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const { classRef, streamRef, subjectRef, difficulty, sourceDoc, mcqs } = security.data;
    const userId = (security.user as any).id;

    // Map questions with bulk context
    const insertPayload = mcqs.map((q) => ({
      question: q.question,
      options: q.options,
      correctIndex: q.correctIndex,
      explanation: q.explanation,
      classRef,
      streamRef: streamRef || undefined,
      subjectRef,
      difficulty,
      sourceDoc: sourceDoc || "",
      status: "published",
      createdBy: userId,
    }));

    const insertedDocs = await MCQ.insertMany(insertPayload);
    const insertedIds = insertedDocs.map((doc) => doc._id.toString());

    return NextResponse.json({
      success: true,
      message: `Successfully saved ${mcqs.length} questions to the MCQ bank.`,
      insertedIds,
    });
  } catch (error: any) {
    console.error("MCQ Batch Save Error:", error);
    return NextResponse.json({ error: "Internal Server Error saving batch." }, { status: 500 });
  }
}

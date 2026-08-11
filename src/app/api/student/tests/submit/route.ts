import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Attempt from "@/models/Attempt";
import Test from "@/models/Test";
import MCQ from "@/models/MCQ";
import { secureRouteHandler } from "@/lib/security";
import { z } from "zod";

const submitSchema = z.object({
  testId: z.string().min(1),
  answers: z.array(
    z.object({
      questionId: z.string().min(1),
      selectedOptionIndex: z.number().int().min(-1),
    })
  ),
  tabSwitchWarnings: z.number().int().min(0),
  durationSecondsUsed: z.number().int().min(0),
  mode: z.enum(["test", "practice"]),
});

export async function POST(req: NextRequest) {
  const security = await secureRouteHandler(req, {
    allowedRoles: ["student", "clerk", "teacher", "admin"],
    schema: submitSchema,
  });

  if (!security.authorized || !security.data || !security.user) {
    return security.response || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();

    const { testId, answers, tabSwitchWarnings, durationSecondsUsed, mode } = security.data;
    const userId = (security.user as any).id;

    // Fetch the test to confirm questions
    const test = await Test.findById(testId);
    if (!test) {
      return NextResponse.json({ error: "Test not found." }, { status: 404 });
    }

    // Grade the answers
    let correctAnswersCount = 0;
    const gradedAnswers = [];

    const mcqIds = (test as any).mcqRefs || [];

    // Loop through test questions
    for (const qId of mcqIds) {
      const mcq = await MCQ.findById(qId);
      if (!mcq) continue;

      // Find if student answered this question
      const studentAnswer = answers.find((ans) => ans.questionId === qId.toString());
      const selectedIndex = studentAnswer !== undefined ? studentAnswer.selectedOptionIndex : -1;
      
      const isCorrect = selectedIndex === mcq.correctIndex;
      if (isCorrect) {
        correctAnswersCount++;
      }

      gradedAnswers.push({
        mcqId: mcq._id,
        selectedIndex,
        correct: isCorrect,
      });
    }

    const totalQuestionsCount = mcqIds.length;
    const scorePercentage = totalQuestionsCount > 0 ? Math.round((correctAnswersCount / totalQuestionsCount) * 100) : 0;

    // Create Attempt record
    const attempt = await Attempt.create({
      studentRef: userId,
      testRef: test._id,
      answers: gradedAnswers,
      mode,
      score: correctAnswersCount,
      totalQuestions: totalQuestionsCount,
      percentage: scorePercentage,
      tabSwitches: tabSwitchWarnings,
      autoSubmitted: tabSwitchWarnings >= 3,
      durationSeconds: durationSecondsUsed,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Test submitted successfully.",
        attemptId: attempt._id.toString(),
        correctAnswersCount,
        totalQuestionsCount,
        scorePercentage,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Test submission grading error:", error);
    return NextResponse.json(
      { error: `Internal server error: ${error?.message || "Unknown error"}. Stack: ${error?.stack || ""}` },
      { status: 500 }
    );
  }
}

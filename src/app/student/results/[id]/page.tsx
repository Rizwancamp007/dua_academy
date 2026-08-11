import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import dbConnect from "@/lib/dbConnect";
import Attempt from "@/models/Attempt";
import MCQ from "@/models/MCQ"; // Register MCQ schema
import Subject from "@/models/Subject"; // Register Subject schema
import StudentResultDetailView from "@/components/StudentResultDetailView";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function StudentResultDetailPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/login");
  }

  const resolvedParams = await params;
  const attemptId = resolvedParams.id;
  const userId = (session.user as any).id;

  await dbConnect();

  // Prevent Webpack tree-shaking
  const _modelReg = [MCQ.modelName, Subject.modelName];

  // Find the attempt
  const attempt = await Attempt.findById(attemptId)
    .populate({
      path: "testRef",
      populate: {
        path: "subjectRef",
        select: "name",
      },
    })
    .lean();
  if (!attempt) {
    notFound();
  }

  // Security check: ensure attempt belongs to logged-in student
  if ((attempt as any).studentRef.toString() !== userId) {
    redirect("/student/results");
  }

  const test = (attempt as any).testRef || {};

  // Fetch MCQ details for each answer
  const questionsList = [];
  for (const ans of (attempt as any).answers) {
    const mcq = await MCQ.findById(ans.mcqId).lean();
    if (!mcq) continue;

    questionsList.push({
      id: mcq._id.toString(),
      questionText: mcq.question,
      options: mcq.options || [],
      correctOptionIndex: mcq.correctIndex,
      selectedOptionIndex: ans.selectedIndex,
      isCorrect: ans.correct,
      explanation: mcq.explanation || "",
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold tracking-tight">
          Review Test Sheet
        </h1>
        <p className="text-sm text-text/60 mt-1">
          Examine correct choices, verify explanation notes, and see your mistakes.
        </p>
      </div>

      <StudentResultDetailView
        testTitle={test.title || "Deleted/Archived Mock Test"}
        subject={test.subjectRef?.name || "General"}
        correctCount={(attempt as any).score || 0}
        totalCount={(attempt as any).totalQuestions || 0}
        percentage={(attempt as any).percentage || 0}
        warnings={(attempt as any).tabSwitches || 0}
        durationSeconds={(attempt as any).durationSeconds || 0}
        mode={(attempt as any).mode || "practice"}
        questions={questionsList}
        showAnswersAtEnd={test.showAnswersAtEnd !== false}
      />
    </div>
  );
}

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import dbConnect from "@/lib/dbConnect";
import Test from "@/models/Test";
import MCQ from "@/models/MCQ"; // Register MCQ schema
import "@/models/Subject"; // Register Subject schema
import StudentTestRunner from "@/components/StudentTestRunner";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ mode?: string }>;
}

export default async function StudentTestRunnerPage({ params, searchParams }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/login");
  }

  // Await params and searchParams
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const testId = resolvedParams.id;
  const mode = resolvedSearchParams.mode === "practice" ? "practice" : "test";

  await dbConnect();

  // Retrieve test and populate questions
  const dbTest = await Test.findById(testId).populate("mcqRefs").populate("subjectRef").lean();
  if (!dbTest) {
    notFound();
  }

  const rawQuestions = (dbTest as any).mcqRefs || [];
  const questions = rawQuestions
    .filter((q: any) => q !== null && q !== undefined)
    .map((q: any) => ({
      _id: q._id ? q._id.toString() : "",
      questionText: q.question || "",
      options: q.options || [],
      correctOptionIndex: typeof q.correctIndex === "number" ? q.correctIndex : 0,
      explanation: q.explanation || "",
      subjectName: (dbTest as any).subjectRef?.name || "General",
    }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold tracking-tight">
          Assessment Runner
        </h1>
        <p className="text-sm text-text/60 mt-1">
          Stay on the active tab while taking timed assessments. Submitting grades the MCQ items immediately.
        </p>
      </div>

      <StudentTestRunner
        testId={dbTest._id.toString()}
        testTitle={dbTest.title}
        durationMinutes={dbTest.durationMinutes || 15}
        questions={questions}
        mode={mode}
      />
    </div>
  );
}

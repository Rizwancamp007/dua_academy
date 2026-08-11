import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/dbConnect";
import Attempt from "@/models/Attempt";
import "@/models/Test"; // Ensure Test model is registered in Mongoose context
import "@/models/Subject"; // Ensure Subject model is registered in Mongoose context
import StudentStatsView from "@/components/StudentStatsView";

export const dynamic = "force-dynamic";

export default async function StudentDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/login");
  }

  await dbConnect();

  const userId = (session.user as any).id;

  // Retrieve student attempts, sorting descending
  const dbAttempts = await Attempt.find({ studentRef: userId })
    .populate({
      path: "testRef",
      populate: {
        path: "subjectRef",
        select: "name",
      },
    })
    .sort({ createdAt: -1 })
    .lean();

  const attempts = dbAttempts.map((att: any) => {
    const test = att.testRef || {};
    const totalQ = att.totalQuestions || 0;
    const score = att.score || 0;
    const percentage = att.percentage || 0;
    const subjectName = test.subjectRef?.name || "General";

    return {
      _id: att._id.toString(),
      testTitle: test.title || "Deleted/Archived Mock Test",
      subject: subjectName,
      score,
      totalQuestions: totalQ,
      percentage,
      createdAt: att.createdAt instanceof Date ? att.createdAt.toISOString() : new Date().toISOString(),
      mode: att.mode || "practice",
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold tracking-tight">
          Welcome back, {session.user.name}!
        </h1>
        <p className="text-sm text-text/60 mt-1">
          Monitor your assessment progress, study video lectures, or run MCQ mocks.
        </p>
      </div>

      <StudentStatsView attempts={attempts} />
    </div>
  );
}

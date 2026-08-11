import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import Test from "@/models/Test";
import "@/models/Subject"; // Register Subject schema in Mongoose context
import StudentTestsView from "@/components/StudentTestsView";

export const dynamic = "force-dynamic";

export default async function StudentTestsPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/login");
  }

  await dbConnect();

  // Get student class from DB
  const user = await User.findOne({ email: session.user.email }).lean();
  if (!user) {
    redirect("/login");
  }

  const studentClassRef = (user as any).studentDetails?.classRef;

  // Fetch active tests matching the class
  const dbTests = await Test.find({ classRef: studentClassRef, isPublished: true })
    .populate("subjectRef")
    .sort({ createdAt: -1 })
    .lean();

  const tests = dbTests.map((t: any) => ({
    _id: t._id.toString(),
    title: t.title,
    description: t.description || "",
    subjectName: t.subjectRef?.name || "General",
    durationMinutes: t.durationMinutes || 15,
    totalQuestionsCount: t.mcqRefs?.length || 0,
    modeSupport: t.mode || "both",
    startTime: t.startTime ? t.startTime.toISOString() : null,
    endTime: t.endTime ? t.endTime.toISOString() : null,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold tracking-tight">
          Coaching Mocks & Practice
        </h1>
        <p className="text-sm text-text/60 mt-1">
          Select an assessment matching your syllabus. Start as timed or practice.
        </p>
      </div>

      <StudentTestsView tests={tests} />
    </div>
  );
}

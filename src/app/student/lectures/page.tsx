import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import Lecture from "@/models/Lecture";
import StudentLecturesView from "@/components/StudentLecturesView";

export const dynamic = "force-dynamic";

export default async function StudentLecturesPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/login");
  }

  await dbConnect();

  // Get current student class from DB
  const user = await User.findOne({ email: session.user.email }).lean();
  if (!user) {
    redirect("/login");
  }

  const studentClass = (user as any).studentDetails?.classRef?.toString() || "";
  
  // Fetch lectures and populate class/stream/subject references
  const dbLectures = await Lecture.find()
    .populate("classRef")
    .populate("streamRef")
    .populate("subjectRef")
    .sort({ createdAt: -1 })
    .lean();

  const lectures = dbLectures.map((l: any) => ({
    _id: l._id.toString(),
    title: l.title,
    description: `Video Lecture for ${l.classRef?.name || "General"} - ${l.subjectRef?.name || "Syllabus"}`,
    videoUrl: l.url,
    platform: l.sourceType,
    classId: l.classRef?._id?.toString() || "",
    className: l.classRef?.name || "General",
    subjectId: l.subjectRef?.name || "General",
    streamName: l.streamRef?.name || "General",
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold tracking-tight">
          Video Lectures
        </h1>
        <p className="text-sm text-text/60 mt-1">
          Explore and study syllabus video courses. Access is governed by your class level.
        </p>
      </div>

      <StudentLecturesView
        lectures={lectures}
        studentClass={studentClass}
        studentEmail={session.user.email}
      />
    </div>
  );
}

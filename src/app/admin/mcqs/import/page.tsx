import dbConnect from "@/lib/dbConnect";
import Class from "@/models/Class";
import Stream from "@/models/Stream";
import Subject from "@/models/Subject";
import AdminMCQImportView from "@/components/AdminMCQImportView";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminMCQImportPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/login");
  }

  const role = (session.user as any).role;
  if (!["admin", "clerk", "teacher"].includes(role)) {
    redirect("/student");
  }

  await dbConnect();

  const [dbClasses, dbStreams, dbSubjects] = await Promise.all([
    Class.find().sort({ name: 1 }).lean(),
    Stream.find().sort({ name: 1 }).lean(),
    Subject.find().populate("classRef", "name").sort({ name: 1 }).lean(),
  ]);

  const classes = dbClasses.map((c: any) => ({
    id: c._id.toString(),
    name: c.name,
  }));

  const streams = dbStreams.map((s: any) => ({
    id: s._id.toString(),
    name: s.name,
  }));

  const subjects = dbSubjects.map((sub: any) => ({
    id: sub._id.toString(),
    name: sub.name,
    classId: sub.classRef?._id?.toString() || "",
    className: sub.classRef?.name || "Unknown",
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold tracking-tight">AI Document MCQ Parser</h1>
        <p className="text-sm text-text/60 mt-1">
          Upload PDF or DOCX lecture sheets. Gemini AI will extract multiple choice questions for manual review and batch insert.
        </p>
      </div>

      <AdminMCQImportView classes={classes} streams={streams} subjects={subjects} />
    </div>
  );
}

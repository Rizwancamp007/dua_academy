import dbConnect from "@/lib/dbConnect";
import Class from "@/models/Class";
import Stream from "@/models/Stream";
import Subject from "@/models/Subject";
import Test from "@/models/Test";
import AdminTestBuilderForm from "@/components/AdminTestBuilderForm";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function AdminTestBuilderPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/login");
  }

  const role = (session.user as any).role;
  if (!["admin", "clerk", "teacher"].includes(role)) {
    redirect("/student");
  }

  const resolvedSearchParams = await searchParams;
  const editId = resolvedSearchParams.id || "";

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

  let initialTest = null;
  if (editId) {
    const dbTest = await Test.findById(editId).lean();
    if (dbTest) {
      initialTest = {
        _id: (dbTest as any)._id.toString(),
        title: (dbTest as any).title,
        classRef: (dbTest as any).classRef?.toString() || "",
        streamRef: (dbTest as any).streamRef?.toString() || "",
        subjectRef: (dbTest as any).subjectRef?.toString() || "",
        durationMinutes: (dbTest as any).durationMinutes || 30,
        mode: (dbTest as any).mode || "both",
        isPublished: (dbTest as any).isPublished || false,
        showAnswersAtEnd: (dbTest as any).showAnswersAtEnd ?? true,
        mcqRefs: ((dbTest as any).mcqRefs || []).map((m: any) => m.toString()),
        startTime: (dbTest as any).startTime ? new Date((dbTest as any).startTime).toISOString().slice(0, 16) : "",
        endTime: (dbTest as any).endTime ? new Date((dbTest as any).endTime).toISOString().slice(0, 16) : "",
      };
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold tracking-tight">
          {initialTest ? "Edit Test Assessment" : "Create Test Assessment"}
        </h1>
        <p className="text-sm text-text/60 mt-1">
          Configure test rules and build a custom question set. Add questions manually or select randomly.
        </p>
      </div>

      <AdminTestBuilderForm
        classes={classes}
        streams={streams}
        subjects={subjects}
        initialTest={initialTest}
      />
    </div>
  );
}

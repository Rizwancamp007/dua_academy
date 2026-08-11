import dbConnect from "@/lib/dbConnect";
import Class from "@/models/Class";
import Subject from "@/models/Subject";
import Test from "@/models/Test";
import AdminResultsListView from "@/components/AdminResultsListView";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminResultsPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/login");
  }

  const role = (session.user as any).role;
  if (!["admin", "clerk", "teacher"].includes(role)) {
    redirect("/student");
  }

  await dbConnect();

  const [dbClasses, dbSubjects, dbTests] = await Promise.all([
    Class.find().sort({ name: 1 }).lean(),
    Subject.find().populate("classRef", "name").sort({ name: 1 }).lean(),
    Test.find().sort({ title: 1 }).lean(),
  ]);

  const classes = dbClasses.map((c: any) => ({
    id: c._id.toString(),
    name: c.name,
  }));

  const subjects = dbSubjects.map((sub: any) => ({
    id: sub._id.toString(),
    name: sub.name,
    classId: sub.classRef?._id?.toString() || "",
    className: sub.classRef?.name || "Unknown",
  }));

  const tests = dbTests.map((t: any) => ({
    id: t._id.toString(),
    title: t.title,
    classId: t.classRef?.toString() || "",
    subjectId: t.subjectRef?.toString() || "",
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold tracking-tight">Student Academic Results</h1>
        <p className="text-sm text-text/60 mt-1">
          Review details of student mock test attempts, monitor cheat/tab-switch events, and export spreadsheet grades.
        </p>
      </div>

      <AdminResultsListView classes={classes} subjects={subjects} tests={tests} />
    </div>
  );
}

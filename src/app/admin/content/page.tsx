import dbConnect from "@/lib/dbConnect";
import Class from "@/models/Class";
import Stream from "@/models/Stream";
import Subject from "@/models/Subject";
import AdminContentView from "@/components/AdminContentView";

export const metadata = {
  title: "Content & Lectures Manager | Duaa Academy Admin",
  description: "Manage video lectures, faculty members, gallery items, hero slides, and wall of honor records.",
};

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  await dbConnect();

  const dbClasses = await Class.find().sort({ name: 1 }).lean();
  const dbStreams = await Stream.find().sort({ name: 1 }).lean();
  const dbSubjects = await Subject.find().sort({ name: 1 }).lean();

  const classes = dbClasses.map((c: any) => ({
    id: c._id.toString(),
    name: c.name,
  }));

  const streams = dbStreams.map((s: any) => ({
    id: s._id.toString(),
    name: s.name,
  }));

  const subjects = dbSubjects.map((s: any) => ({
    id: s._id.toString(),
    name: s.name,
    classId: s.classRef?.toString() || "",
  }));

  return (
    <AdminContentView
      classes={classes}
      streams={streams}
      subjects={subjects}
    />
  );
}

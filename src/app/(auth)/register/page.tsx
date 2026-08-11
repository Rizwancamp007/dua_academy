import dbConnect from "@/lib/dbConnect";
import Class from "@/models/Class";
import Stream from "@/models/Stream";
import RegisterForm from "@/components/RegisterForm";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  await dbConnect();

  // Fetch active classes and streams for dropdowns
  const dbClasses = await Class.find().sort({ name: 1 }).lean();
  const dbStreams = await Stream.find().sort({ name: 1 }).lean();

  const classes = dbClasses.map((c: any) => ({
    id: c._id.toString(),
    name: c.name,
  }));

  const streams = dbStreams.map((s: any) => ({
    id: s._id.toString(),
    name: s.name,
  }));

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <RegisterForm classes={classes} streams={streams} />
    </div>
  );
}

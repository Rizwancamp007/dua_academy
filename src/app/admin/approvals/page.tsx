import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import AdminApprovalsView from "@/components/AdminApprovalsView";

export const dynamic = "force-dynamic";

export default async function AdminApprovalsPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/login");
  }

  // Double check role authorization
  const role = (session.user as any).role;
  if (role !== "admin" && role !== "clerk") {
    redirect("/student");
  }

  await dbConnect();

  // Query all users that are students
  const dbStudents = await User.find({ role: "student" })
    .sort({ createdAt: -1 })
    .lean();

  const initialStudents = dbStudents.map((st: any) => ({
    _id: st._id.toString(),
    name: st.name,
    email: st.email,
    phone: st.phone || "N/A",
    fatherName: st.studentDetails?.fatherName || "N/A",
    city: st.studentDetails?.city || "N/A",
    className: st.studentDetails?.classId || "General",
    streamName: st.studentDetails?.streamId || "N/A",
    isApproved: st.isApproved || false,
    createdAt: st.createdAt instanceof Date ? st.createdAt.toISOString() : new Date().toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold tracking-tight">
          Enrollment Approvals
        </h1>
        <p className="text-sm text-text/60 mt-1">
          Review student registration details, verify identities, and approve/decline active platform access.
        </p>
      </div>

      <AdminApprovalsView initialStudents={initialStudents} />
    </div>
  );
}

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import StudentSettingsForm from "@/components/StudentSettingsForm";

export const dynamic = "force-dynamic";

export default async function StudentSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/login");
  }

  await dbConnect();

  // Retrieve current student profile details
  const user = await User.findOne({ email: session.user.email }).lean();
  if (!user) {
    redirect("/login");
  }

  const initialData = {
    name: user.name,
    phone: user.phone || "",
    fatherName: (user as any).studentDetails?.fatherName || "",
    city: (user as any).studentDetails?.city || "",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold tracking-tight">
          Profile Settings
        </h1>
        <p className="text-sm text-text/60 mt-1">
          Manage your personal details and secure your student account.
        </p>
      </div>

      <StudentSettingsForm initialData={initialData} />
    </div>
  );
}

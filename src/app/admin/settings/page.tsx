import dbConnect from "@/lib/dbConnect";
import SiteSettings from "@/models/SiteSettings";
import User from "@/models/User";
import AdminSettingsView from "@/components/AdminSettingsView";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/login");
  }

  const role = (session.user as any).role;
  if (!["admin", "clerk", "teacher"].includes(role)) {
    redirect("/student");
  }

  await dbConnect();

  // Load singleton settings
  let settingsDoc = await SiteSettings.findOne().lean();
  if (!settingsDoc) {
    settingsDoc = await SiteSettings.create({});
  }

  const settings = {
    commenceDate: (settingsDoc as any).commenceDate || "",
    classTimings: (settingsDoc as any).classTimings || "",
    admissionsOpen: !!(settingsDoc as any).admissionsOpen,
    whatsappNumber: (settingsDoc as any).whatsappNumber || "",
    address: (settingsDoc as any).address || "",
  };

  // Load current staff users (non-students)
  const dbStaff = await User.find({ role: { $ne: "student" } }).sort({ name: 1 }).lean();
  const staff = dbStaff.map((u: any) => ({
    id: u._id.toString(),
    name: u.name,
    email: u.email,
    role: u.role,
  }));

  const currentAdminId = (session.user as any).id;
  const isAdmin = role === "admin";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold tracking-tight">System Settings</h1>
        <p className="text-sm text-text/60 mt-1">
          Configure admissions deadlines, adjust class hours, and manage staff credentials or permissions.
        </p>
      </div>

      <AdminSettingsView
        initialSettings={settings}
        initialStaff={staff}
        currentAdminId={currentAdminId}
        isAdmin={isAdmin}
      />
    </div>
  );
}

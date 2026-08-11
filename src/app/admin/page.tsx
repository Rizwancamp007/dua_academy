import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import MCQ from "@/models/MCQ";
import Test from "@/models/Test";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Users, FileSpreadsheet, Layers, ShieldCheck, ArrowRight, UserPlus, FilePlus, Settings } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/login");
  }

  const role = (session.user as any).role;
  if (role !== "admin" && role !== "clerk") {
    redirect("/student");
  }

  await dbConnect();

  // Fetch count statistics
  const totalStudents = await User.countDocuments({ role: "student" });
  const pendingStudents = await User.countDocuments({ role: "student", isApproved: false });
  const totalMCQs = await MCQ.countDocuments();
  const totalTests = await Test.countDocuments();

  const stats = [
    {
      name: "Total Students",
      value: totalStudents,
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      name: "Pending Approvals",
      value: pendingStudents,
      icon: UserPlus,
      color: "text-yellow-600",
      bg: "bg-yellow-500/10",
      badge: pendingStudents > 0 ? `${pendingStudents} Actionable` : null,
    },
    {
      name: "MCQ Bank Items",
      value: totalMCQs,
      icon: FileSpreadsheet,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      name: "Active Mock Tests",
      value: totalTests,
      icon: Layers,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold tracking-tight">
          Welcome to the Control Board, {session.user.name}
        </h1>
        <p className="text-sm text-text/60 mt-1">
          Monitor registration queues, modify test materials, and control site parameters.
        </p>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name} hoverLift={true} className="flex flex-col justify-between h-full p-6 border border-border">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                {stat.badge && (
                  <Badge variant="warning" className="text-[10px]">
                    {stat.badge}
                  </Badge>
                )}
              </div>

              <div>
                <p className="text-sm text-text/60">{stat.name}</p>
                <h3 className="text-3xl font-serif font-bold mt-1">{stat.value}</h3>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick Launchpad Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card hoverLift={false} className="p-6 border border-border bg-surface">
          <h3 className="font-serif text-lg font-bold mb-4 flex items-center gap-2 border-b border-border/50 pb-2">
            <ShieldCheck className="w-5 h-5 text-primary" /> Onboarding & Verification
          </h3>
          <p className="text-sm text-text/70 mb-6 leading-relaxed">
            Verify student registration queues. Approve entries or revoke credentials for graduated class sessions.
          </p>
          <Link href="/admin/approvals">
            <Button className="flex items-center gap-2">
              Go to Approvals <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </Card>

        <Card hoverLift={false} className="p-6 border border-border bg-surface">
          <h3 className="font-serif text-lg font-bold mb-4 flex items-center gap-2 border-b border-border/50 pb-2">
            <FilePlus className="w-5 h-5 text-primary" /> MCQ & Assessment Management
          </h3>
          <p className="text-sm text-text/70 mb-6 leading-relaxed">
            Manage your question repository. Add new physics, biology, chemistry questions, and create timed mock test papers.
          </p>
          <div className="flex gap-4">
            <Link href="/admin/mcqs">
              <Button variant="outline" className="flex items-center gap-1.5">
                Manage MCQs
              </Button>
            </Link>
            <Link href="/admin/tests">
              <Button className="flex items-center gap-1.5">
                Mock Builder
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

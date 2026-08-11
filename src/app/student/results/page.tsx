import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/dbConnect";
import Attempt from "@/models/Attempt";
import "@/models/Test"; // Ensure Test model is registered in Mongoose context
import "@/models/Subject"; // Register Subject schema
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Award, Calendar, Clock, AlertTriangle, Eye, ArrowRight } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function StudentResultsPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/login");
  }

  await dbConnect();

  const userId = (session.user as any).id;

  // Retrieve all test attempts by this student
  const dbAttempts = await Attempt.find({ studentRef: userId })
    .populate({
      path: "testRef",
      populate: {
        path: "subjectRef",
        select: "name",
      },
    })
    .sort({ createdAt: -1 })
    .lean();

  const attempts = dbAttempts.map((att: any) => {
    const test = att.testRef || {};
    const totalQ = att.totalQuestions || 0;
    const score = att.score || 0;
    const percentage = att.percentage || 0;

    return {
      _id: att._id.toString(),
      testTitle: test.title || "Deleted/Archived Mock Test",
      subject: test.subjectRef?.name || "General",
      score,
      totalQuestions: totalQ,
      percentage,
      createdAt: att.createdAt,
      warnings: att.tabSwitches || 0,
      mode: att.mode || "practice",
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold tracking-tight flex items-center gap-2">
          <Award className="w-8 h-8 text-primary" /> Assessment History & Results
        </h1>
        <p className="text-sm text-text/60 mt-1">
          Review your scores, analyze subject strength/weakness, and re-read MCQ explanations.
        </p>
      </div>

      {attempts.length > 0 ? (
        <Card hoverLift={false} className="overflow-hidden border border-border">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-primary/5 text-xs font-semibold uppercase tracking-wider text-text/70 border-b border-border">
                  <th className="py-3 px-6">Test Title</th>
                  <th className="py-3 px-6">Subject</th>
                  <th className="py-3 px-6">Completion Date</th>
                  <th className="py-3 px-6">Warnings</th>
                  <th className="py-3 px-6 text-center">Score</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-sm">
                {attempts.map((attempt) => (
                  <tr key={attempt._id} className="hover:bg-primary/5 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-medium text-text">{attempt.testTitle}</div>
                      <div className="text-[10px] font-bold uppercase tracking-wide text-text/50 mt-0.5">
                        Mode: {attempt.mode}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant="outline">{attempt.subject}</Badge>
                    </td>
                    <td className="py-4 px-6 text-text/60 text-xs">
                      {new Date(attempt.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                      <span className="block text-[10px] mt-0.5">
                        {new Date(attempt.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {attempt.warnings > 0 ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-yellow-600">
                          <AlertTriangle className="w-3.5 h-3.5" /> {attempt.warnings}
                        </span>
                      ) : (
                        <span className="text-xs text-text/40">None</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <Badge variant={attempt.percentage >= 60 ? "success" : "danger"}>
                        {attempt.score}/{attempt.totalQuestions} ({attempt.percentage}%)
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link href={`/student/results/${attempt._id}`}>
                        <Button size="sm" variant="ghost" className="text-xs flex items-center gap-1 hover:bg-primary/10">
                          <Eye className="w-3.5 h-3.5" /> Review Answers
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card hoverLift={false} className="text-center py-20 border border-dashed border-border bg-surface max-w-xl mx-auto">
          <Award className="w-16 h-16 text-text/20 mx-auto mb-4" />
          <h3 className="font-serif text-xl font-bold mb-2">No Assessment Records</h3>
          <p className="text-sm text-text/60 mb-6">
            You haven't completed any mock tests yet. Take a test to view your scores.
          </p>
          <Link href="/student/tests">
            <Button className="flex items-center gap-1.5 mx-auto">
              Browse Available Tests <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </Card>
      )}
    </div>
  );
}

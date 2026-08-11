"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ClipboardList, Trophy, TrendingUp, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";

interface AttemptData {
  _id: string;
  testTitle: string;
  subject: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  createdAt: string;
  mode: string;
}

export function StudentStatsView({ attempts }: { attempts: AttemptData[] }) {
  // 1. Calculate general statistics
  const totalAttempts = attempts.length;
  
  const avgPercentage = totalAttempts > 0
    ? Math.round(attempts.reduce((sum, item) => sum + item.percentage, 0) / totalAttempts)
    : 0;

  const highestPercentage = totalAttempts > 0
    ? Math.max(...attempts.map((item) => item.percentage))
    : 0;

  // 2. Prepare score trends data (chronological order)
  const trendData = [...attempts]
    .reverse()
    .map((item, idx) => ({
      name: `Test ${idx + 1}`,
      score: item.percentage,
      title: item.testTitle,
    }));

  // 3. Prepare subject breakdown data
  const subjectScores: Record<string, { sum: number; count: number }> = {};
  attempts.forEach((item) => {
    if (!subjectScores[item.subject]) {
      subjectScores[item.subject] = { sum: 0, count: 0 };
    }
    subjectScores[item.subject].sum += item.percentage;
    subjectScores[item.subject].count += 1;
  });

  const subjectData = Object.keys(subjectScores).map((subject) => ({
    subject,
    average: Math.round(subjectScores[subject].sum / subjectScores[subject].count),
  }));

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card hoverLift={true} className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-primary/10 text-primary">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-text/60">Total Mock Tests</p>
            <h3 className="text-3xl font-serif font-bold">{totalAttempts}</h3>
          </div>
        </Card>

        <Card hoverLift={true} className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-secondary/20 text-secondary">
            <TrendingUp className="w-6 h-6 text-yellow-600 dark:text-secondary" />
          </div>
          <div>
            <p className="text-sm text-text/60">Average Accuracy</p>
            <h3 className="text-3xl font-serif font-bold">{avgPercentage}%</h3>
          </div>
        </Card>

        <Card hoverLift={true} className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-green-500/10 text-green-600">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-text/60">Highest Score</p>
            <h3 className="text-3xl font-serif font-bold">{highestPercentage}%</h3>
          </div>
        </Card>
      </div>

      {/* Analytics Charts */}
      {totalAttempts > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Trend Chart */}
          <Card hoverLift={false} className="p-6">
            <h3 className="font-serif text-lg font-bold mb-4 flex items-center gap-2">
              Performance Trend
            </h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border/40" />
                  <XAxis dataKey="name" stroke="currentColor" className="text-text/60 text-xs" />
                  <YAxis domain={[0, 100]} stroke="currentColor" className="text-text/60 text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-surface)",
                      borderColor: "var(--color-border)",
                      color: "var(--color-text)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="var(--color-primary)"
                    strokeWidth={3}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Subject Breakdown Chart */}
          <Card hoverLift={false} className="p-6">
            <h3 className="font-serif text-lg font-bold mb-4 flex items-center gap-2">
              Subject Accuracy Breakdown
            </h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border/40" />
                  <XAxis dataKey="subject" stroke="currentColor" className="text-text/60 text-xs" />
                  <YAxis domain={[0, 100]} stroke="currentColor" className="text-text/60 text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-surface)",
                      borderColor: "var(--color-border)",
                      color: "var(--color-text)",
                    }}
                  />
                  <Bar dataKey="average" fill="var(--color-secondary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      ) : (
        <div className="text-center py-16 border border-dashed border-border rounded-xl bg-surface">
          <TrendingUp className="w-12 h-12 text-text/20 mx-auto mb-3" />
          <h4 className="font-serif text-lg font-bold">No Assessment Data Yet</h4>
          <p className="text-sm text-text/60 max-w-sm mx-auto mt-1 mb-6">
            Complete your first mock test or practice quiz from the sidebar to visualize your performance growth.
          </p>
          <Link href="/student/tests">
            <Button size="sm" className="flex items-center gap-2">
              Explore Available Tests <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      )}

      {/* Recent Attempts Table */}
      {totalAttempts > 0 && (
        <Card hoverLift={false} className="overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold">Recent Test Attempts</h3>
            <Link href="/student/results">
              <Button variant="ghost" size="sm" className="text-xs flex items-center gap-1.5">
                View All Results <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-primary/5 text-xs font-semibold uppercase tracking-wider text-text/70 border-b border-border">
                  <th className="py-3 px-6">Test Title</th>
                  <th className="py-3 px-6">Subject</th>
                  <th className="py-3 px-6">Date Taken</th>
                  <th className="py-3 px-6">Mode</th>
                  <th className="py-3 px-6 text-right">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-sm">
                {attempts.slice(0, 5).map((attempt) => (
                  <tr key={attempt._id} className="hover:bg-primary/5 transition-colors">
                    <td className="py-4 px-6 font-medium">{attempt.testTitle}</td>
                    <td className="py-4 px-6">
                      <Badge variant="outline">{attempt.subject}</Badge>
                    </td>
                    <td className="py-4 px-6 text-text/60">
                      {new Date(attempt.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-4 px-6 uppercase text-xs font-bold text-text/60">
                      {attempt.mode}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Badge variant={attempt.percentage >= 60 ? "success" : "danger"}>
                        {attempt.score}/{attempt.totalQuestions} ({attempt.percentage}%)
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
export default StudentStatsView;

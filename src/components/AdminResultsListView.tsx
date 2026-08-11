"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Download, AlertTriangle, Eye, ShieldAlert } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface Option {
  id: string;
  name: string;
}

interface SubjectOption {
  id: string;
  name: string;
  classId: string;
  className: string;
}

interface TestOption {
  id: string;
  title: string;
  classId: string;
  subjectId: string;
}

interface AttemptRecord {
  _id: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  testTitle: string;
  className: string;
  subjectName: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  tabSwitches: number;
  autoSubmitted: boolean;
  mode: string;
  createdAt: string;
}

interface AdminResultsListViewProps {
  classes: Option[];
  subjects: SubjectOption[];
  tests: TestOption[];
}

export default function AdminResultsListView({ classes, subjects, tests }: AdminResultsListViewProps) {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTest, setSelectedTest] = useState("");

  const [attempts, setAttempts] = useState<AttemptRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Detail Modal state
  const [detailAttempt, setDetailAttempt] = useState<AttemptRecord | null>(null);
  const [detailQuestions, setDetailQuestions] = useState<any[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  // Fetch attempts from API
  const fetchAttempts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        classRef: selectedClass,
        subjectRef: selectedSubject,
        testRef: selectedTest,
      });

      const res = await fetch(`/api/admin/results?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setAttempts(data.attempts || []);
      }
    } catch (err) {
      console.error("Error fetching results:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttempts();
  }, [selectedClass, selectedSubject, selectedTest]);

  // Dynamically filter options
  const filteredSubjects = selectedClass
    ? subjects.filter((s) => s.classId === selectedClass)
    : subjects;

  const filteredTests = tests.filter((t) => {
    if (selectedClass && t.classId !== selectedClass) return false;
    if (selectedSubject && t.subjectId !== selectedSubject) return false;
    return true;
  });

  // Client-side CSV Exporter
  const handleExportCSV = () => {
    if (attempts.length === 0) return;

    const headers = [
      "Student Name",
      "Student Email",
      "Test Title",
      "Class",
      "Subject",
      "Mode",
      "Score",
      "Total Questions",
      "Percentage (%)",
      "Tab Switch Warnings",
      "Auto Submitted",
      "Date Completed",
    ];

    const rows = attempts.map((att) => [
      `"${att.studentName}"`,
      `"${att.studentEmail}"`,
      `"${att.testTitle}"`,
      `"${att.className}"`,
      `"${att.subjectName}"`,
      `"${att.mode.toUpperCase()}"`,
      att.score,
      att.totalQuestions,
      att.percentage,
      att.tabSwitches,
      att.autoSubmitted ? "YES" : "NO",
      new Date(att.createdAt).toLocaleString(),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Student_Results_Export_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Load specific attempt answers detail for reviewing
  const handleViewDetails = async (att: AttemptRecord) => {
    setDetailAttempt(att);
    setDetailLoading(true);
    setDetailQuestions([]);

    try {
      // Reuse student result detail endpoint
      const res = await fetch(`/api/student/results/details?id=${att._id}`);
      if (res.ok) {
        const data = await res.json();
        setDetailQuestions(data.questions || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filtering Options Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              setSelectedSubject("");
              setSelectedTest("");
            }}
            className="h-10 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-secondary/50"
          >
            <option value="">-- All Classes --</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={selectedSubject}
            onChange={(e) => {
              setSelectedSubject(e.target.value);
              setSelectedTest("");
            }}
            className="h-10 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-secondary/50"
          >
            <option value="">-- All Subjects --</option>
            {filteredSubjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name} ({sub.className})
              </option>
            ))}
          </select>

          <select
            value={selectedTest}
            onChange={(e) => setSelectedTest(e.target.value)}
            className="h-10 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-secondary/50"
          >
            <option value="">-- All Assessments --</option>
            {filteredTests.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        </div>

        <Button
          onClick={handleExportCSV}
          disabled={attempts.length === 0}
          className="flex items-center gap-1.5 justify-center w-full sm:w-auto"
        >
          <Download className="w-4 h-4" /> Export Grades
        </Button>
      </div>

      {/* Results Table */}
      <Card hoverLift={false} className="border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-primary/5 text-xs font-semibold uppercase tracking-wider text-text/70 border-b border-border">
                <th className="py-3 px-6">Student</th>
                <th className="py-3 px-6">Mock Test</th>
                <th className="py-3 px-6">Class / Subject</th>
                <th className="py-3 px-6 text-center">Score</th>
                <th className="py-3 px-6 text-center">Tab Switches</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-text/50">
                    Loading academic records...
                  </td>
                </tr>
              ) : attempts.length > 0 ? (
                attempts.map((att) => (
                  <tr key={att._id} className="hover:bg-primary/5 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-text">{att.studentName}</div>
                      <div className="text-xs text-text/50">{att.studentEmail}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-text">{att.testTitle}</div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-text/40 mt-0.5">
                        Mode: {att.mode}
                      </div>
                    </td>
                    <td className="py-4 px-6 space-y-1">
                      <Badge variant="outline">{att.className}</Badge>
                      <span className="block text-xs text-text/60">{att.subjectName}</span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <Badge variant={att.percentage >= 60 ? "success" : "danger"}>
                        {att.score}/{att.totalQuestions} ({att.percentage}%)
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-center">
                      {att.tabSwitches > 0 ? (
                        <span className={`inline-flex items-center gap-1 text-xs font-bold ${
                          att.tabSwitches >= 3 ? "text-red-500" : "text-yellow-600"
                        }`}>
                          <AlertTriangle className="w-3.5 h-3.5" /> {att.tabSwitches}{" "}
                          {att.autoSubmitted && "(Auto Submitted)"}
                        </span>
                      ) : (
                        <span className="text-text/30 text-xs">None</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      {/* We'll pass a mock handler for viewing detailed logs */}
                      <Button onClick={() => handleViewDetails(att)} size="sm" variant="ghost" className="text-xs flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" /> View Paper
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-text/50">
                    No matching student assessment scores found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Review Student Sheet Modal */}
      <AnimatePresence>
        {detailAttempt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface border border-border w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-primary/5">
                <div>
                  <h3 className="font-serif text-lg font-bold">Review Answer Paper</h3>
                  <p className="text-xs text-text/50">
                    Student: {detailAttempt.studentName} ({detailAttempt.studentEmail})
                  </p>
                </div>
                <button onClick={() => setDetailAttempt(null)} className="text-text/50 hover:text-text">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scroll Container */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Stats Summary */}
                <div className="grid grid-cols-3 gap-4 text-center border-b border-border/50 pb-4">
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-text/40">Total Score</span>
                    <span className="text-lg font-bold text-text">
                      {detailAttempt.score} / {detailAttempt.totalQuestions}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-text/40">Percentage</span>
                    <span className="text-lg font-bold text-text">{detailAttempt.percentage}%</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-text/40">Tab Warnings</span>
                    <span className="text-lg font-bold text-red-500">{detailAttempt.tabSwitches}</span>
                  </div>
                </div>

                {/* Questions Preview */}
                {detailLoading ? (
                  <div className="text-center py-12 text-text/50">Loading student sheet answers...</div>
                ) : detailQuestions.length > 0 ? (
                  <div className="space-y-4">
                    {detailQuestions.map((q: any, idx: number) => (
                      <div key={idx} className="p-4 rounded-lg border border-border bg-surface/50 space-y-2">
                        <div className="flex items-start justify-between gap-4">
                          <p className="font-medium text-sm text-text">{q.questionText}</p>
                          <Badge variant={q.isCorrect ? "success" : "danger"}>
                            {q.isCorrect ? "Correct" : "Incorrect"}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pl-2">
                          {q.options.map((opt: string, optIdx: number) => {
                            const isCorrectAnswer = optIdx === q.correctOptionIndex;
                            const isSelectedAnswer = optIdx === q.selectedOptionIndex;

                            let textClass = "text-text/60";
                            if (isCorrectAnswer) textClass = "text-green-600 font-bold";
                            else if (isSelectedAnswer) textClass = "text-red-500 font-bold";

                            return (
                              <div key={optIdx} className={textClass}>
                                {["A", "B", "C", "D"][optIdx]}. {opt}{" "}
                                {isCorrectAnswer && "✓"}{" "}
                                {isSelectedAnswer && "✗"}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-text/40">No question response logging available.</div>
                )}
              </div>

              {/* Close Button Footer */}
              <div className="px-6 py-4 border-t border-border flex items-center justify-end bg-primary/5">
                <Button onClick={() => setDetailAttempt(null)}>Close Paper</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Inline Close Icon
function X({ className, ...props }: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className={className}
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

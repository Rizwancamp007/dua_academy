"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Layers, Plus, Edit, Trash2, ShieldCheck, ShieldAlert } from "lucide-react";
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

interface TestData {
  _id: string;
  title: string;
  classRef?: { _id: string; name: string };
  streamRef?: { _id: string; name: string };
  subjectRef?: { _id: string; name: string };
  mode: string;
  durationMinutes: number;
  mcqRefs: string[];
  isPublished: boolean;
}

interface AdminTestListViewProps {
  classes: Option[];
  streams: Option[];
  subjects: SubjectOption[];
}

export default function AdminTestListView({ classes, streams, subjects }: AdminTestListViewProps) {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  const [tests, setTests] = useState<TestData[]>([]);
  const [loading, setLoading] = useState(true);

  // Delete modal state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Load tests from API
  const fetchTests = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        classRef: selectedClass,
        subjectRef: selectedSubject,
      });

      const res = await fetch(`/api/admin/tests?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTests(data.tests || []);
      }
    } catch (err) {
      console.error("Error loading tests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, [selectedClass, selectedSubject]);

  // Dynamically filter subjects based on selected class
  const filteredSubjects = selectedClass
    ? subjects.filter((sub) => sub.classId === selectedClass)
    : subjects;

  // Toggle publish status
  const handleTogglePublish = async (test: TestData) => {
    try {
      const payload = {
        id: test._id,
        title: test.title,
        classRef: test.classRef?._id,
        streamRef: test.streamRef?._id || "",
        subjectRef: test.subjectRef?._id,
        durationMinutes: test.durationMinutes,
        mode: test.mode,
        isPublished: !test.isPublished,
        mcqRefs: test.mcqRefs,
      };

      const res = await fetch("/api/admin/tests", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        fetchTests();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete trigger
  const handleDelete = async () => {
    if (!deleteId) return;

    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/tests?id=${deleteId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setDeleteId(null);
        fetchTests();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter bar & Add button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              setSelectedSubject("");
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
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="h-10 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-secondary/50"
          >
            <option value="">-- All Subjects --</option>
            {filteredSubjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name} ({sub.className})
              </option>
            ))}
          </select>
        </div>

        <Link href="/admin/tests/create">
          <Button className="flex items-center gap-1.5 w-full sm:w-auto justify-center">
            <Plus className="w-4 h-4" /> Create Test
          </Button>
        </Link>
      </div>

      {/* Tests Table */}
      <Card hoverLift={false} className="border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-primary/5 text-xs font-semibold uppercase tracking-wider text-text/70 border-b border-border">
                <th className="py-3 px-6">Test Title</th>
                <th className="py-3 px-6">Class / Subject</th>
                <th className="py-3 px-6 text-center">Questions</th>
                <th className="py-3 px-6 text-center">Duration</th>
                <th className="py-3 px-6">Supported Mode</th>
                <th className="py-3 px-6 text-center">Status</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-text/50">
                    Loading test list...
                  </td>
                </tr>
              ) : tests.length > 0 ? (
                tests.map((test) => (
                  <tr key={test._id} className="hover:bg-primary/5 transition-colors">
                    <td className="py-4 px-6 font-medium text-text">{test.title}</td>
                    <td className="py-4 px-6 space-y-1">
                      <Badge variant="outline">{test.classRef?.name || "General"}</Badge>
                      <span className="block text-xs font-medium text-text/60">
                        {test.subjectRef?.name || "N/A"}{" "}
                        {test.streamRef ? `(${test.streamRef.name})` : ""}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center font-bold">
                      {test.mcqRefs?.length || 0} Qs
                    </td>
                    <td className="py-4 px-6 text-center text-text/60">
                      {test.durationMinutes} min
                    </td>
                    <td className="py-4 px-6 uppercase text-xs font-bold text-text/60">
                      {test.mode}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleTogglePublish(test)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          test.isPublished
                            ? "bg-green-500/10 text-green-600 border border-green-500/30"
                            : "bg-yellow-500/10 text-yellow-600 border border-yellow-500/30"
                        }`}
                      >
                        {test.isPublished ? (
                          <>
                            <ShieldCheck className="w-3.5 h-3.5" /> Published
                          </>
                        ) : (
                          <>
                            <ShieldAlert className="w-3.5 h-3.5" /> Draft
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                      <Link href={`/admin/tests/create?id=${test._id}`}>
                        <Button size="sm" variant="ghost">
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                      <Button onClick={() => setDeleteId(test._id)} size="sm" variant="ghost" className="text-red-500 hover:text-red-600">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-text/50">
                    No tests found. Click "Create Test" to build your first assessment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface border border-border max-w-md w-full rounded-xl shadow-2xl p-6 text-center space-y-4"
            >
              <div className="p-3 rounded-full bg-red-500/10 text-red-500 w-fit mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold">Delete Test Assessment</h3>
              <p className="text-sm text-text/60">
                Are you absolutely sure you want to delete this test assessment? This action is permanent and cannot be undone.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <Button variant="ghost" onClick={() => setDeleteId(null)}>
                  Cancel
                </Button>
                <Button variant="outline" className="border-red-500 text-red-500 hover:bg-red-50" onClick={handleDelete} loading={deleteLoading}>
                  Delete Test
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

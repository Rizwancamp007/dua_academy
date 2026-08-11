"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Search, Plus, Upload, Edit, Trash2, X, ChevronLeft, ChevronRight } from "lucide-react";
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

interface MCQData {
  _id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  classRef?: { _id: string; name: string };
  streamRef?: { _id: string; name: string };
  subjectRef?: { _id: string; name: string };
  difficulty: string;
  status: string;
}

interface AdminMCQListViewProps {
  classes: Option[];
  streams: Option[];
  subjects: SubjectOption[];
}

export default function AdminMCQListView({ classes, streams, subjects }: AdminMCQListViewProps) {
  // Query state
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedStream, setSelectedStream] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedSource, setSelectedSource] = useState("");

  // Paginated data state
  const [mcqs, setMcqs] = useState<MCQData[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Modal / Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMcq, setFormMcq] = useState<any | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  // Delete modal state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Load MCQs from API
  const fetchMCQs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        search,
        classRef: selectedClass,
        streamRef: selectedStream,
        subjectRef: selectedSubject,
        source: selectedSource,
      });

      const res = await fetch(`/api/admin/mcqs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setMcqs(data.mcqs || []);
        setTotalCount(data.totalCount || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error("Error loading MCQs:", err);
    } finally {
      setLoading(false);
    }
  };

  const [sourcesList, setSourcesList] = useState<string[]>([]);

  // Fetch unique sources list on mount
  useEffect(() => {
    const fetchSources = async () => {
      try {
        const res = await fetch("/api/admin/mcqs/sources");
        if (res.ok) {
          const data = await res.json();
          setSourcesList(data.sources || []);
        }
      } catch (err) {
        console.error("Error loading sources:", err);
      }
    };
    fetchSources();
  }, []);

  useEffect(() => {
    fetchMCQs();
  }, [page, selectedClass, selectedStream, selectedSubject, selectedSource]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchMCQs();
  };

  // Dynamically filter subject options based on selected class
  const filteredSubjects = selectedClass
    ? subjects.filter((sub) => sub.classId === selectedClass)
    : subjects;

  // Open Form modal for New MCQ or Edit
  const openForm = (mcqItem: MCQData | null = null) => {
    setFormError("");
    const mcq = mcqItem as any;
    if (mcq) {
      setFormMcq({
        _id: mcq._id,
        question: mcq.question,
        options: [...mcq.options],
        correctIndex: mcq.correctIndex,
        explanation: mcq.explanation || "",
        classRef: mcq.classRef?._id || "",
        streamRef: mcq.streamRef?._id || "",
        subjectRef: mcq.subjectRef?._id || "",
        difficulty: mcq.difficulty || "medium",
        status: mcq.status || "published",
      });
    } else {
      setFormMcq({
        question: "",
        options: ["", "", "", ""],
        correctIndex: 0,
        explanation: "",
        classRef: classes[0]?.id || "",
        streamRef: "",
        subjectRef: subjects.filter((s) => s.classId === (classes[0]?.id || ""))[0]?.id || "",
        difficulty: "medium",
        status: "published",
      });
    }
    setIsFormOpen(true);
  };

  // Handle Form changes
  const handleFormChange = (key: string, value: any) => {
    if (!formMcq) return;

    if (key === "classRef") {
      // Automatically update subject options if class changes
      const firstSubjectForClass = subjects.find((s) => s.classId === value);
      setFormMcq({
        ...formMcq,
        classRef: value,
        subjectRef: firstSubjectForClass ? firstSubjectForClass.id : "",
      });
    } else if (key.startsWith("option-")) {
      const idx = parseInt(key.split("-")[1], 10);
      const newOptions = [...(formMcq.options || ["", "", "", ""])];
      newOptions[idx] = value;
      setFormMcq({ ...formMcq, options: newOptions });
    } else {
      setFormMcq({ ...formMcq, [key]: value });
    }
  };

  // Submit MCQ Form (POST or PUT)
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formMcq) return;

    setFormLoading(true);
    setFormError("");

    try {
      const isEdit = !!formMcq._id;
      const url = "/api/admin/mcqs";
      const method = isEdit ? "PUT" : "POST";

      const payload = {
        id: formMcq._id,
        question: formMcq.question,
        options: formMcq.options,
        correctIndex: formMcq.correctIndex,
        explanation: formMcq.explanation,
        classRef: formMcq.classRef,
        streamRef: formMcq.streamRef || null,
        subjectRef: formMcq.subjectRef,
        difficulty: formMcq.difficulty,
        status: formMcq.status,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setIsFormOpen(false);
        setFormMcq(null);
        fetchMCQs();
      } else {
        setFormError(data.error || "Failed to save question.");
      }
    } catch (err) {
      setFormError("An unexpected connection error occurred.");
    } finally {
      setFormLoading(false);
    }
  };

  // Delete MCQ trigger
  const handleDelete = async () => {
    if (!deleteId) return;

    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/mcqs?id=${deleteId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setDeleteId(null);
        fetchMCQs();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Bulk rename source document
  const handleRenameSource = async (oldName: string) => {
    const newName = prompt("Enter new name for this document:", oldName);
    if (!newName || newName.trim() === "" || newName === oldName) return;

    try {
      const res = await fetch("/api/admin/mcqs/sources", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldName, newName: newName.trim() }),
      });
      if (res.ok) {
        const sourcesRes = await fetch("/api/admin/mcqs/sources");
        if (sourcesRes.ok) {
          const sourcesData = await sourcesRes.json();
          setSourcesList(sourcesData.sources || []);
        }
        setSelectedSource(newName.trim());
        fetchMCQs();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to rename document.");
      }
    } catch (err) {
      console.error(err);
      alert("Connection error renaming document.");
    }
  };

  // Bulk delete source document and its MCQs
  const handleDeleteSource = async (sourceName: string) => {
    const confirmDelete = confirm(
      `Are you absolutely sure you want to delete the document "${sourceName}"? This will delete all MCQs associated with this document from the question bank. This action cannot be undone.`
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/admin/mcqs/sources?sourceName=${encodeURIComponent(sourceName)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        const sourcesRes = await fetch("/api/admin/mcqs/sources");
        if (sourcesRes.ok) {
          const sourcesData = await sourcesRes.json();
          setSourcesList(sourcesData.sources || []);
        }
        setSelectedSource("");
        fetchMCQs();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete document.");
      }
    } catch (err) {
      console.error(err);
      alert("Connection error deleting document.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Actions & Filters Grid */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Form */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-md w-full">
          <Input
            name="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions..."
          />
          <Button type="submit">Search</Button>
        </form>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 text-primary border border-primary/20 rounded-lg px-3 py-1.5 text-xs font-bold shrink-0">
            Total Bank: {totalCount} MCQs
          </div>
          <Link href="/admin/mcqs/import">
            <Button variant="outline" className="flex items-center gap-1.5">
              <Upload className="w-4 h-4" /> AI Import
            </Button>
          </Link>
          <Button onClick={() => openForm(null)} className="flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Add MCQ
          </Button>
        </div>
      </div>

      {/* Filter Options Panel */}
      <Card hoverLift={false} className="p-4 border border-border bg-surface/50 grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-text/50 block mb-1">
            Filter by Class
          </label>
          <select
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              setSelectedSubject(""); // Reset subject if class changes
              setPage(1);
            }}
            className="w-full h-10 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-secondary/50"
          >
            <option value="">-- All Classes --</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-text/50 block mb-1">
            Filter by Stream
          </label>
          <select
            value={selectedStream}
            onChange={(e) => {
              setSelectedStream(e.target.value);
              setPage(1);
            }}
            className="w-full h-10 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-secondary/50"
          >
            <option value="">-- All Streams --</option>
            {streams.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-text/50 block mb-1">
            Filter by Subject
          </label>
          <select
            value={selectedSubject}
            onChange={(e) => {
              setSelectedSubject(e.target.value);
              setPage(1);
            }}
            className="w-full h-10 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-secondary/50"
          >
            <option value="">-- All Subjects --</option>
            {filteredSubjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name} ({sub.className})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-text/50 block mb-1">
            Filter by Source
          </label>
          <select
            value={selectedSource}
            onChange={(e) => {
              setSelectedSource(e.target.value);
              setPage(1);
            }}
            className="w-full h-10 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-secondary/50"
          >
            <option value="">-- All Sources --</option>
            <option value="ai">🤖 AI Parsed Only</option>
            <option value="manual">✍️ Manual / Direct Only</option>
            {sourcesList.length > 0 && (
              <optgroup label="Imported Documents">
                {sourcesList.map((src) => (
                  <option key={src} value={src}>
                    📄 {src}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </div>
      </Card>

      {selectedSource && !["ai", "manual"].includes(selectedSource) && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
          <div className="text-sm">
            <span className="font-semibold text-amber-600 dark:text-amber-400">Source Document Options:</span>{" "}
            <span className="text-text/80 font-mono text-xs">{selectedSource}</span>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleRenameSource(selectedSource)}
              className="text-xs w-full sm:w-auto"
            >
              Rename Document
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleDeleteSource(selectedSource)}
              className="text-xs border-red-500/30 text-red-500 hover:bg-red-500/10 w-full sm:w-auto"
            >
              Delete Document & MCQs
            </Button>
          </div>
        </div>
      )}

      {/* MCQ Table */}
      <Card hoverLift={false} className="border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-primary/5 text-xs font-semibold uppercase tracking-wider text-text/70 border-b border-border">
                <th className="py-3 px-6 w-1/2">Question</th>
                <th className="py-3 px-6">Class / Subject</th>
                <th className="py-3 px-6">Correct Option</th>
                <th className="py-3 px-6">Difficulty</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-text/50">
                    Loading question bank...
                  </td>
                </tr>
              ) : mcqs.length > 0 ? (
                mcqs.map((mcq) => (
                  <tr key={mcq._id} className="hover:bg-primary/5 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-medium text-text max-w-xl line-clamp-2">
                        {mcq.question}
                      </div>
                      {mcq.explanation && (
                        <div className="text-xs text-text/40 mt-1 italic line-clamp-1">
                          Exp: {mcq.explanation}
                        </div>
                      )}
                      {(mcq as any).sourceDoc && (
                        <div className="text-[10px] text-amber-500 font-semibold mt-1 flex items-center gap-1">
                          <span>🤖</span>
                          <span className="truncate">{(mcq as any).sourceDoc}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6 space-y-1">
                      <Badge variant="outline">{mcq.classRef?.name || "General"}</Badge>
                      <span className="block text-xs font-medium text-text/60">
                        {mcq.subjectRef?.name || "N/A"}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant="outline" className="font-bold">
                        {["A", "B", "C", "D"][mcq.correctIndex]}:{" "}
                        <span className="font-normal">{mcq.options[mcq.correctIndex]}</span>
                      </Badge>
                    </td>
                    <td className="py-4 px-6 uppercase text-xs font-bold text-text/60">
                      {mcq.difficulty}
                    </td>
                    <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                      <Button onClick={() => openForm(mcq)} size="sm" variant="ghost">
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button onClick={() => setDeleteId(mcq._id)} size="sm" variant="ghost" className="text-red-500 hover:text-red-600">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-text/50">
                    No questions found matching selected filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-border flex items-center justify-between text-sm">
            <span className="text-text/60">
              Showing {(page - 1) * 50 + 1} - {Math.min(page * 50, totalCount)} of {totalCount} questions
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="w-4 h-4" /> Prev
              </Button>
              <span className="font-medium">
                Page {page} of {totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
              >
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Manual Add / Edit MCQ Modal */}
      <AnimatePresence>
        {isFormOpen && formMcq && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface border border-border w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-primary/5">
                <h3 className="font-serif text-lg font-bold">
                  {formMcq._id ? "Edit MCQ Item" : "Create New MCQ"}
                </h3>
                <button onClick={() => setIsFormOpen(false)} className="text-text/50 hover:text-text">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Scroll Container */}
              <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                {formError && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 font-medium text-xs">
                    {formError}
                  </div>
                )}

                {/* Question Prompt */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-text/80">Question Text *</label>
                  <textarea
                    required
                    value={formMcq.question || ""}
                    onChange={(e) => handleFormChange("question", e.target.value)}
                    rows={3}
                    placeholder="Enter question statement here..."
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-secondary/50"
                  />
                </div>

                {/* Options 4 Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(formMcq.options || ["", "", "", ""]).map((opt: string, idx: number) => (
                    <div key={idx} className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-text/60">
                        Option {["A", "B", "C", "D"][idx]} *
                      </label>
                      <input
                        type="text"
                        required
                        value={opt}
                        onChange={(e) => handleFormChange(`option-${idx}`, e.target.value)}
                        placeholder={`Option text for ${["A", "B", "C", "D"][idx]}`}
                        className="w-full h-10 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-secondary/50"
                      />
                    </div>
                  ))}
                </div>

                {/* Correct Choice Index */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-text/80">Correct Option *</label>
                    <select
                      value={formMcq.correctIndex}
                      onChange={(e) => handleFormChange("correctIndex", parseInt(e.target.value, 10))}
                      className="w-full h-10 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-secondary/50"
                    >
                      <option value={0}>Option A</option>
                      <option value={1}>Option B</option>
                      <option value={2}>Option C</option>
                      <option value={3}>Option D</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-text/80">Difficulty *</label>
                    <select
                      value={formMcq.difficulty}
                      onChange={(e) => handleFormChange("difficulty", e.target.value)}
                      className="w-full h-10 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-secondary/50"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>

                {/* Filters setup class stream subject */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-text/60">Class *</label>
                    <select
                      value={formMcq.classRef as any}
                      onChange={(e) => handleFormChange("classRef", e.target.value)}
                      className="w-full h-10 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-secondary/50"
                    >
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-text/60">Stream (Optional)</label>
                    <select
                      value={(formMcq.streamRef as any) || ""}
                      onChange={(e) => handleFormChange("streamRef", e.target.value)}
                      className="w-full h-10 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-secondary/50"
                    >
                      <option value="">-- None --</option>
                      {streams.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-text/60">Subject *</label>
                    <select
                      value={formMcq.subjectRef as any}
                      onChange={(e) => handleFormChange("subjectRef", e.target.value)}
                      className="w-full h-10 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-secondary/50"
                    >
                      {subjects
                        .filter((s) => s.classId === (formMcq.classRef || classes[0]?.id))
                        .map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                {/* Explanation */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-text/80">Explanation Statement</label>
                  <textarea
                    value={formMcq.explanation || ""}
                    onChange={(e) => handleFormChange("explanation", e.target.value)}
                    rows={2}
                    placeholder="Provide explanatory details for why this answer is correct..."
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-secondary/50"
                  />
                </div>
              </form>

              {/* Action Buttons footer */}
              <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3 bg-primary/5">
                <Button variant="ghost" onClick={() => setIsFormOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleFormSubmit} loading={formLoading}>
                  {formMcq._id ? "Update MCQ" : "Save MCQ"}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
              <h3 className="font-serif text-lg font-bold">Delete MCQ Item</h3>
              <p className="text-sm text-text/60">
                Are you absolutely sure you want to delete this question? This action is permanent and cannot be undone.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <Button variant="ghost" onClick={() => setDeleteId(null)}>
                  Cancel
                </Button>
                <Button variant="outline" className="border-red-500 text-red-500 hover:bg-red-50" onClick={handleDelete} loading={deleteLoading}>
                  Delete Question
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

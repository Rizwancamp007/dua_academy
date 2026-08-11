"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import { useRouter as useNextRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { FileUp, Trash2, Edit2, AlertCircle, Sparkles, CheckCircle2 } from "lucide-react";

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

interface ParsedMCQ {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface AdminMCQImportViewProps {
  classes: Option[];
  streams: Option[];
  subjects: SubjectOption[];
}

export default function AdminMCQImportView({ classes, streams, subjects }: AdminMCQImportViewProps) {
  const router = useNextRouter();

  // Targets
  const [classRef, setClassRef] = useState(classes[0]?.id || "");
  const [streamRef, setStreamRef] = useState("");
  const [subjectRef, setSubjectRef] = useState("");
  const [difficulty, setDifficulty] = useState("medium");

  // File
  const [file, setFile] = useState<File | null>(null);

  // States
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [parsedMCQs, setParsedMCQs] = useState<ParsedMCQ[]>([]);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Set default subject
  if (!subjectRef && classRef) {
    const firstSub = subjects.find((s) => s.classId === classRef);
    if (firstSub) {
      setSubjectRef(firstSub.id);
    }
  }

  const filteredSubjects = subjects.filter((s) => s.classId === classRef);

  // File drop/change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setErrorMessage("");
    }
  };

  // Upload & run Gemini AI Pipeline
  const handleUploadAndParse = async () => {
    if (!file) {
      setErrorMessage("Please select a file to parse.");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setParsedMCQs([]);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/mcqs/import", {
        method: "POST",
        body: formData,
      });

      const text = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch (jsonErr) {
        throw new Error(text.slice(0, 300) || `Server error (Status: ${res.status})`);
      }

      if (res.ok) {
        setParsedMCQs(data.mcqs || []);
      } else {
        setErrorMessage(data.error || "Failed to parse document. Please ensure it's not password-protected.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected connection error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Update parsed question field inline
  const handleUpdateParsedField = (index: number, key: string, value: any) => {
    const updated = [...parsedMCQs];
    if (key.startsWith("option-")) {
      const optIdx = parseInt(key.split("-")[1], 10);
      updated[index].options[optIdx] = value;
    } else {
      (updated[index] as any)[key] = value;
    }
    setParsedMCQs(updated);
  };

  // Delete parsed question
  const handleDeleteParsedQuestion = (index: number) => {
    setParsedMCQs(parsedMCQs.filter((_, idx) => idx !== index));
  };

  // Submit verified batch to database
  const handleSaveBatch = async () => {
    if (!classRef || !subjectRef) {
      setErrorMessage("Target Class and Subject are required.");
      return;
    }
    if (parsedMCQs.length === 0) {
      setErrorMessage("There are no questions to save.");
      return;
    }

    setSaveLoading(true);
    setErrorMessage("");

    try {
      const payload = {
        classRef,
        streamRef: streamRef || null,
        subjectRef,
        difficulty,
        sourceDoc: file ? `AI: ${file.name}` : "AI: Document",
        mcqs: parsedMCQs,
      };

      const res = await fetch("/api/admin/mcqs/import/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch (jsonErr) {
        setErrorMessage(text.slice(0, 300) || `Server error (Status: ${res.status})`);
        return;
      }

      if (res.ok) {
        setSaveSuccess(true);
        setParsedMCQs([]);
        setFile(null);
        setTimeout(() => {
          router.push("/admin/mcqs");
          router.refresh();
        }, 2000);
      } else {
        setErrorMessage(data.error || "Failed to save questions to bank.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Connection issue saving questions.");
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {errorMessage && (
        <Card hoverLift={false} className="p-4 bg-red-500/10 border-red-500/30 text-red-500 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm font-medium">{errorMessage}</span>
        </Card>
      )}

      {saveSuccess && (
        <Card hoverLift={false} className="p-6 bg-green-500/10 border-green-500/30 text-green-600 flex flex-col items-center justify-center text-center gap-3">
          <CheckCircle2 className="w-12 h-12 text-green-600" />
          <h3 className="font-serif text-lg font-bold">Import Batch Saved!</h3>
          <p className="text-sm text-text/70">
            Successfully inserted all reviewed questions into the MCQ bank. Redirecting you back...
          </p>
        </Card>
      )}

      {/* Configuration & File Selector */}
      {!saveSuccess && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Target config */}
          <Card hoverLift={false} className="p-6 border border-border space-y-6 lg:col-span-1">
            <h3 className="font-serif text-lg font-bold border-b border-border/50 pb-2">Target Scope</h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-text/60">Class *</label>
                <select
                  value={classRef}
                  onChange={(e) => {
                    setClassRef(e.target.value);
                    setSubjectRef("");
                  }}
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
                  value={streamRef}
                  onChange={(e) => setStreamRef(e.target.value)}
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
                  value={subjectRef}
                  onChange={(e) => setSubjectRef(e.target.value)}
                  className="w-full h-10 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-secondary/50"
                >
                  {filteredSubjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-text/60">Difficulty *</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full h-10 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-secondary/50"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>
          </Card>

          {/* File Upload Zone */}
          <Card hoverLift={false} className="p-6 border border-border space-y-6 lg:col-span-2 flex flex-col justify-between">
            <div>
              <h3 className="font-serif text-lg font-bold border-b border-border/50 pb-2">Upload Lecture File</h3>
              <p className="text-sm text-text/60 mt-1 mb-6">
                Drag-and-drop or click below to upload syllabus documents. Supported file formats: PDF (.pdf) or Word (.docx) up to 5MB.
              </p>

              {/* Upload area */}
              <div className="border-2 border-dashed border-border hover:border-primary/50 transition-all rounded-xl p-8 text-center relative bg-surface/50">
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <FileUp className="w-12 h-12 text-text/30 mx-auto mb-4" />
                <span className="block text-sm font-medium mb-1">
                  {file ? file.name : "Select PDF or Word Document"}
                </span>
                <span className="block text-xs text-text/40">
                  {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "File size limits apply"}
                </span>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-border/40 mt-6">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setFile(null);
                  setParsedMCQs([]);
                }}
                disabled={loading}
              >
                Clear
              </Button>
              <Button
                type="button"
                onClick={handleUploadAndParse}
                loading={loading}
                disabled={!file}
                className="flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-yellow-400 fill-yellow-400" /> Start AI Parsing
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Loader */}
      {loading && (
        <Card hoverLift={false} className="p-12 border border-border text-center space-y-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <h3 className="font-serif text-lg font-bold">Parsing Document...</h3>
          <p className="text-sm text-text/60 max-w-md mx-auto">
            Extracting text and calling Gemini AI to generate high-quality assessment items. This might take 10-20 seconds.
          </p>
        </Card>
      )}

      {/* Preview and Review Panel */}
      {parsedMCQs.length > 0 && (
        <Card hoverLift={false} className="p-6 border border-border space-y-6">
          <div className="flex items-center justify-between border-b border-border/50 pb-3">
            <h3 className="font-serif text-lg font-bold">Review Generated Questions</h3>
            <span className="text-sm font-semibold text-text/70">{parsedMCQs.length} items parsed</span>
          </div>

          <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
            {parsedMCQs.map((mcq, idx) => (
              <Card key={idx} hoverLift={false} className="p-4 border border-border bg-surface/50 space-y-4 relative">
                <button
                  type="button"
                  onClick={() => handleDeleteParsedQuestion(idx)}
                  className="absolute top-4 right-4 text-red-500 hover:bg-red-500/10 p-1.5 rounded-lg transition-all"
                  title="Remove this question"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <Badge variant="outline">Item #{idx + 1}</Badge>

                {/* Question Text */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-text/50">QuestionStatement</label>
                  <textarea
                    value={mcq.question}
                    onChange={(e) => handleUpdateParsedField(idx, "question", e.target.value)}
                    rows={2}
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-secondary/50"
                  />
                </div>

                {/* Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {mcq.options.map((opt, optIdx) => (
                    <div key={optIdx} className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-text/40">
                        Option {["A", "B", "C", "D"][optIdx]}
                      </label>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => handleUpdateParsedField(idx, `option-${optIdx}`, e.target.value)}
                        className="w-full h-10 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-secondary/50"
                      />
                    </div>
                  ))}
                </div>

                {/* Correct Choice Index & Explanation */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-text/50">Correct Choice</label>
                    <select
                      value={mcq.correctIndex}
                      onChange={(e) => handleUpdateParsedField(idx, "correctIndex", parseInt(e.target.value, 10))}
                      className="w-full h-10 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-secondary/50"
                    >
                      <option value={0}>Option A</option>
                      <option value={1}>Option B</option>
                      <option value={2}>Option C</option>
                      <option value={3}>Option D</option>
                    </select>
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-text/50">Explanation</label>
                    <input
                      type="text"
                      value={mcq.explanation}
                      onChange={(e) => handleUpdateParsedField(idx, "explanation", e.target.value)}
                      className="w-full h-10 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-secondary/50"
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-border/40">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setParsedMCQs([])}
            >
              Cancel Preview
            </Button>
            <Button
              type="button"
              onClick={handleSaveBatch}
              loading={saveLoading}
              className="flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" /> Save Verified Batch
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

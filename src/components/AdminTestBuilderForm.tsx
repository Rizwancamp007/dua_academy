"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Search, Save, X, Shuffle, CheckSquare, Square, Sparkles, FileUp, AlertCircle, CheckCircle2, Edit2, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";

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

interface MCQItem {
  _id: string;
  question: string;
  options: string[];
  correctIndex: number;
  difficulty: string;
}

interface InitialTestData {
  _id?: string;
  title: string;
  classRef: string;
  streamRef?: string;
  subjectRef: string;
  durationMinutes: number;
  mode: string;
  isPublished: boolean;
  showAnswersAtEnd: boolean;
  mcqRefs: string[];
  startTime?: string;
  endTime?: string;
}

interface AdminTestBuilderFormProps {
  classes: Option[];
  streams: Option[];
  subjects: SubjectOption[];
  initialTest: InitialTestData | null;
}

export default function AdminTestBuilderForm({ classes, streams, subjects, initialTest }: AdminTestBuilderFormProps) {
  const router = useRouter();

  // Form parameters
  const [title, setTitle] = useState(initialTest?.title || "");
  const [classRef, setClassRef] = useState(initialTest?.classRef || classes[0]?.id || "");
  const [streamRef, setStreamRef] = useState(initialTest?.streamRef || "");
  const [subjectRef, setSubjectRef] = useState(initialTest?.subjectRef || "");
  const [durationMinutes, setDurationMinutes] = useState(initialTest?.durationMinutes || 30);
  const [mode, setMode] = useState(initialTest?.mode || "both");
  const [isPublished, setIsPublished] = useState(initialTest?.isPublished || false);
  const [showAnswersAtEnd, setShowAnswersAtEnd] = useState(initialTest?.showAnswersAtEnd ?? true);
  const [startTime, setStartTime] = useState(initialTest?.startTime || "");
  const [endTime, setEndTime] = useState(initialTest?.endTime || "");

  // Selection state
  const [selectedMCQIds, setSelectedMCQIds] = useState<string[]>(initialTest?.mcqRefs || []);

  // MCQ loader state
  const [availableMCQs, setAvailableMCQs] = useState<MCQItem[]>([]);
  const [mcqSearch, setMcqSearch] = useState("");
  const [mcqsLoading, setMcqsLoading] = useState(false);
  const [randomCount, setRandomCount] = useState(10);

  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  // AI Doc Parser States
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiFile, setAiFile] = useState<File | null>(null);
  const [aiParsing, setAiParsing] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiParsedMCQs, setAiParsedMCQs] = useState<any[]>([]);
  const [aiSaveLoading, setAiSaveLoading] = useState(false);
  const [aiDifficulty, setAiDifficulty] = useState("medium");

  const [sourcesList, setSourcesList] = useState<string[]>([]);
  const [selectedSourceFilter, setSelectedSourceFilter] = useState("");

  // Set default subject if empty
  useEffect(() => {
    if (!subjectRef && classRef) {
      const firstSubject = subjects.find((s) => s.classId === classRef);
      if (firstSubject) {
        setSubjectRef(firstSubject.id);
      }
    }
  }, [classRef, subjectRef, subjects]);

  // Load unique sources list
  useEffect(() => {
    const fetchSources = async () => {
      try {
        const res = await fetch("/api/admin/mcqs/sources");
        if (res.ok) {
          const data = await res.json();
          setSourcesList(data.sources || []);
        }
      } catch (err) {
        console.error("Error fetching sources:", err);
      }
    };
    fetchSources();
  }, []);

  // Load MCQs matching selected class and subject
  useEffect(() => {
    if (!classRef || !subjectRef) return;

    const fetchMCQs = async () => {
      setMcqsLoading(true);
      try {
        // Fetch up to 1000 questions matching the class and subject
        const params = new URLSearchParams({
          classRef,
          subjectRef,
          limit: "1000",
        } as any);

        const res = await fetch(`/api/admin/mcqs?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setAvailableMCQs(data.mcqs || []);
        }
      } catch (err) {
        console.error("Error fetching MCQs:", err);
      } finally {
        setMcqsLoading(false);
      }
    };

    fetchMCQs();
  }, [classRef, subjectRef]);

  // Auto-select all questions from source when source filter changes
  useEffect(() => {
    if (!selectedSourceFilter) return;

    const sourceMCQs = availableMCQs.filter((mcq) => {
      const sourceDoc = (mcq as any).sourceDoc || "";
      if (selectedSourceFilter === "ai") {
        return sourceDoc.startsWith("AI:");
      } else if (selectedSourceFilter === "manual") {
        return !sourceDoc || sourceDoc === "Manual";
      } else {
        return sourceDoc === selectedSourceFilter;
      }
    });

    if (sourceMCQs.length === 0) return;

    const newSelectedIds = [...selectedMCQIds];
    let changed = false;
    sourceMCQs.forEach((mcq) => {
      if (!newSelectedIds.includes(mcq._id)) {
        newSelectedIds.push(mcq._id);
        changed = true;
      }
    });

    if (changed) {
      setSelectedMCQIds(newSelectedIds);
    }
  }, [selectedSourceFilter, availableMCQs]);

  // Automatically adjust duration in minutes to match selected MCQs count (1 min per MCQ)
  useEffect(() => {
    if (!initialTest && selectedMCQIds.length > 0) {
      setDurationMinutes(selectedMCQIds.length);
    }
  }, [selectedMCQIds.length, initialTest]);

  // Filter subjects options
  const filteredSubjects = subjects.filter((s) => s.classId === classRef);

  // Toggle individual question selection
  const toggleSelectMCQ = (id: string) => {
    if (selectedMCQIds.includes(id)) {
      setSelectedMCQIds(selectedMCQIds.filter((item) => item !== id));
    } else {
      setSelectedMCQIds([...selectedMCQIds, id]);
    }
  };

  // Toggle select all visible
  const handleToggleSelectAll = (visibleMCQs: MCQItem[]) => {
    const visibleIds = visibleMCQs.map((m) => m._id);
    const allSelected = visibleIds.every((id) => selectedMCQIds.includes(id));

    if (allSelected) {
      // Remove all visible
      setSelectedMCQIds(selectedMCQIds.filter((id) => !visibleIds.includes(id)));
    } else {
      // Add all missing visible
      const newSelections = [...selectedMCQIds];
      visibleIds.forEach((id) => {
        if (!newSelections.includes(id)) {
          newSelections.push(id);
        }
      });
      setSelectedMCQIds(newSelections);
    }
  };

  // Random selection generator helper
  const handleSelectRandom = () => {
    if (availableMCQs.length === 0) return;

    // Reset selection and select randomly from available
    const count = Math.min(randomCount, availableMCQs.length);
    const shuffled = [...availableMCQs].sort(() => 0.5 - Math.random());
    const randomSelections = shuffled.slice(0, count).map((m) => m._id);

    setSelectedMCQIds(randomSelections);
  };

  // Submit test assessment
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setFormError("Test Title is required.");
      return;
    }
    if (selectedMCQIds.length === 0) {
      setFormError("At least 1 question must be selected for the test.");
      return;
    }

    setFormLoading(true);
    setFormError("");

    try {
      const isEdit = !!initialTest?._id;
      const url = "/api/admin/tests";
      const method = isEdit ? "PUT" : "POST";

      const payload = {
        id: initialTest?._id,
        title,
        classRef,
        streamRef: streamRef || null,
        subjectRef,
        durationMinutes: Number(durationMinutes),
        mode,
        isPublished,
        showAnswersAtEnd,
        mcqRefs: selectedMCQIds,
        startTime: startTime || null,
        endTime: endTime || null,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        router.push("/admin/tests");
        router.refresh();
      } else {
        setFormError(data.error || "Failed to save test.");
      }
    } catch (err) {
      setFormError("An unexpected connection error occurred.");
    } finally {
      setFormLoading(false);
    }
  };

  // Filter available MCQs locally based on search input and source filter
  const visibleMCQs = availableMCQs.filter((mcq) => {
    const matchesSearch = mcq.question.toLowerCase().includes(mcqSearch.toLowerCase());
    let matchesSource = true;
    const sourceDoc = (mcq as any).sourceDoc || "";
    if (selectedSourceFilter) {
      if (selectedSourceFilter === "ai") {
        matchesSource = sourceDoc.startsWith("AI:");
      } else if (selectedSourceFilter === "manual") {
        matchesSource = !sourceDoc || sourceDoc === "Manual";
      } else {
        matchesSource = sourceDoc === selectedSourceFilter;
      }
    }
    return matchesSearch && matchesSource;
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-24">
      {formError && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 font-medium text-sm">
          {formError}
        </div>
      )}

      {/* Main Settings Panel */}
      <Card hoverLift={false} className="p-6 border border-border space-y-6">
        <h3 className="font-serif text-xl font-bold border-b border-border/50 pb-2">
          Test Parameters
        </h3>

        {/* Title */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-text/80">Test Title *</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Physics Mock Test 1 - Thermodynamics"
            className="w-full h-10 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-secondary/50"
          />
        </div>

        {/* Filters Group Class Stream Subject */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text/80">Class Ref *</label>
            <select
              value={classRef}
              onChange={(e) => {
                setClassRef(e.target.value);
                setSubjectRef("");
                setSelectedMCQIds([]); // Reset questions selection if class changes
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
            <label className="text-sm font-medium text-text/80">Stream Ref (Optional)</label>
            <select
              value={streamRef}
              onChange={(e) => setStreamRef(e.target.value)}
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

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text/80">Subject Ref *</label>
            <select
              value={subjectRef}
              onChange={(e) => {
                setSubjectRef(e.target.value);
                setSelectedMCQIds([]); // Reset questions selection if subject changes
              }}
              className="w-full h-10 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-secondary/50"
            >
              <option value="">-- Choose Subject --</option>
              {filteredSubjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Timings, duration and mode */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text/80">Duration (Minutes) *</label>
            <input
              type="number"
              required
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10))}
              min={1}
              className="w-full h-10 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-secondary/50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text/80">Supported Mode *</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="w-full h-10 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-secondary/50"
            >
              <option value="both">Both (Timed & Practice)</option>
              <option value="timed">Timed Mode Only</option>
              <option value="practice">Practice Mode Only</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text/80">Show Answers at End?</label>
            <select
              value={showAnswersAtEnd ? "yes" : "no"}
              onChange={(e) => setShowAnswersAtEnd(e.target.value === "yes")}
              className="w-full h-10 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-secondary/50"
            >
              <option value="yes">Yes, show correct answers on submission</option>
              <option value="no">No, hide answer sheets from student</option>
            </select>
          </div>
        </div>

        {/* Start / End Time Constraints */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text/80">Start Lock Time (Optional)</label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full h-10 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-secondary/50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text/80">End Lock Time (Optional)</label>
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full h-10 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-secondary/50"
            />
          </div>
        </div>

        {/* Publish Flag */}
        <div className="flex items-center space-x-3 pt-2">
          <input
            id="isPublished"
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="w-4 h-4 rounded text-primary focus:ring-secondary/50 border-border bg-surface"
          />
          <label htmlFor="isPublished" className="text-sm font-semibold uppercase tracking-wider text-text/75 cursor-pointer">
            Publish assessment immediately (Visible to students)
          </label>
        </div>
      </Card>

      {/* MCQ Selection Area */}
      <Card hoverLift={false} className="p-6 border border-border space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-border/50 pb-3 gap-4">
          <h3 className="font-serif text-xl font-bold">
            Select MCQ Questions
          </h3>

          {/* Random selection helper & AI trigger */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs text-text/60">Generate Random:</span>
              <input
                type="number"
                value={randomCount}
                onChange={(e) => setRandomCount(Math.max(1, parseInt(e.target.value, 10)))}
                className="w-16 h-8 text-center rounded-lg border border-border bg-surface text-xs focus:outline-none"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSelectRandom}
                className="flex items-center gap-1 text-xs"
                disabled={availableMCQs.length === 0}
              >
                <Shuffle className="w-3.5 h-3.5" /> Pick
              </Button>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAIModalOpen(true)}
              className="flex items-center gap-1 text-xs border-amber-500/30 text-amber-500 hover:bg-amber-500/10 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" /> AI Document Parser
            </Button>
          </div>
        </div>

        {/* Subtitle / Search Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1 w-full">
            <Input
              value={mcqSearch}
              onChange={(e) => setMcqSearch(e.target.value)}
              placeholder="Search loaded questions statement..."
            />
          </div>

          <div className="w-full sm:w-64">
            <select
              value={selectedSourceFilter}
              onChange={(e) => setSelectedSourceFilter(e.target.value)}
              className="w-full h-10 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-secondary/50"
            >
              <option value="">-- All Sources --</option>
              <option value="ai">🤖 AI Parsed Only</option>
              <option value="manual">✍️ Manual Only</option>
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

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleToggleSelectAll(visibleMCQs)}
            className="text-xs shrink-0"
            disabled={visibleMCQs.length === 0}
          >
            {visibleMCQs.every((m) => selectedMCQIds.includes(m._id))
              ? "Deselect All Visible"
              : "Select All Visible"}
          </Button>
        </div>

        {/* Questions Checklist */}
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
          {mcqsLoading ? (
            <div className="text-center py-12 text-text/50">Loading matching questions from bank...</div>
          ) : visibleMCQs.length > 0 ? (
            visibleMCQs.map((mcq) => {
              const isChecked = selectedMCQIds.includes(mcq._id);
              return (
                <div
                  key={mcq._id}
                  onClick={() => toggleSelectMCQ(mcq._id)}
                  className={`flex items-start gap-4 p-4 rounded-lg border transition-all cursor-pointer ${
                    isChecked
                      ? "border-primary bg-primary/5"
                      : "border-border bg-surface hover:bg-primary/5"
                  }`}
                >
                  <button type="button" className="mt-0.5 text-primary">
                    {isChecked ? (
                      <CheckSquare className="w-5 h-5" />
                    ) : (
                      <Square className="w-5 h-5 text-text/30" />
                    )}
                  </button>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <p className="font-medium text-sm text-text">{mcq.question}</p>
                      <Badge variant="outline" className="uppercase text-[10px]">
                        {mcq.difficulty}
                      </Badge>
                    </div>

                    {/* Options list */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-text/70 pl-2">
                      {mcq.options.map((opt, idx) => (
                        <div
                          key={idx}
                          className={idx === mcq.correctIndex ? "text-green-600 font-semibold" : ""}
                        >
                          {["A", "B", "C", "D"][idx]}. {opt}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 text-text/40">
              No matching questions available. Add questions in MCQ Bank or change Class/Subject.
            </div>
          )}
        </div>
      </Card>

      {/* Floating builder status footer */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface/80 backdrop-blur-md border-t border-border py-4 px-6 shadow-2xl flex items-center justify-between">
        <div className="text-sm font-medium text-text/80 pl-4">
          Total Selected:{" "}
          <span className="text-primary font-bold text-lg">{selectedMCQIds.length}</span>{" "}
          questions
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push("/admin/tests")}
            disabled={formLoading}
          >
            Cancel
          </Button>
          <Button type="submit" loading={formLoading} className="flex items-center gap-2">
            <Save className="w-4 h-4" /> Save Assessment
          </Button>
        </div>
      </div>

      {/* AI Document parsing Modal */}
      <Modal
        isOpen={isAIModalOpen}
        onClose={() => {
          if (!aiParsing && !aiSaveLoading) {
            setIsAIModalOpen(false);
            setAiFile(null);
            setAiParsedMCQs([]);
            setAiError("");
          }
        }}
        title="AI Document MCQ Parser"
      >
        <div className="space-y-6">
          {aiError && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{aiError}</span>
            </div>
          )}

          {aiParsedMCQs.length === 0 ? (
            <div className="space-y-4">
              <p className="text-xs text-text/60">
                Upload a lecture sheet or document (PDF or DOCX). Gemini AI will extract 4-option questions and set correct answers instantly.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-text/50">Difficulty</label>
                  <select
                    value={aiDifficulty}
                    onChange={(e) => setAiDifficulty(e.target.value)}
                    className="w-full h-10 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-secondary/50"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-text/50">File (PDF/DOCX) *</label>
                  <div className="relative border border-dashed border-border rounded-lg p-3 hover:bg-primary/5 transition-colors flex flex-col items-center justify-center cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf,.docx"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setAiFile(e.target.files[0]);
                          setAiError("");
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <FileUp className="w-6 h-6 text-text/40 mb-1" />
                    <span className="text-xs font-bold text-text/80">
                      {aiFile ? aiFile.name : "Select Document File"}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                type="button"
                className="w-full justify-center flex items-center gap-1.5"
                loading={aiParsing}
                onClick={async () => {
                  if (!aiFile) {
                    setAiError("Please select a file to parse.");
                    return;
                  }
                  setAiParsing(true);
                  setAiError("");
                  try {
                    const formData = new FormData();
                    formData.append("file", aiFile);

                    const res = await fetch("/api/admin/mcqs/import", {
                      method: "POST",
                      body: formData,
                    });
                    const text = await res.text();
                    let data: any = {};
                    try {
                      data = JSON.parse(text);
                    } catch (jsonErr) {
                      setAiError(text.slice(0, 300) || `Server error (Status: ${res.status})`);
                      return;
                    }
                    if (res.ok) {
                      setAiParsedMCQs(data.mcqs || []);
                    } else {
                      setAiError(data.error || "Failed to parse document.");
                    }
                  } catch (err: any) {
                    setAiError(err.message || "Connection issue parsing document.");
                  } finally {
                    setAiParsing(false);
                  }
                }}
              >
                <Sparkles className="w-4 h-4" /> Start Extraction
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border/50 pb-2">
                <span className="text-xs font-bold text-text/60">
                  Extracted {aiParsedMCQs.length} questions from {aiFile?.name}
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setAiParsedMCQs([])}
                >
                  Start Over
                </Button>
              </div>

              {/* Review List */}
              <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-1">
                {aiParsedMCQs.map((q, idx) => (
                  <div key={idx} className="p-3 rounded-lg border border-border bg-surface/50 space-y-2 relative group">
                    <button
                      type="button"
                      onClick={() => {
                        setAiParsedMCQs(aiParsedMCQs.filter((_, i) => i !== idx));
                      }}
                      className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-500/10 rounded cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <input
                      type="text"
                      value={q.question}
                      onChange={(e) => {
                        const updated = [...aiParsedMCQs];
                        updated[idx].question = e.target.value;
                        setAiParsedMCQs(updated);
                      }}
                      className="w-full text-xs font-semibold bg-transparent border-b border-border/40 focus:border-primary focus:outline-none pb-1 pr-6"
                    />

                    <div className="grid grid-cols-2 gap-2">
                      {q.options.map((opt: string, optIdx: number) => (
                        <div key={optIdx} className="flex items-center gap-1">
                          <input
                            type="radio"
                            name={`correct-${idx}`}
                            checked={q.correctIndex === optIdx}
                            onChange={() => {
                              const updated = [...aiParsedMCQs];
                              updated[idx].correctIndex = optIdx;
                              setAiParsedMCQs(updated);
                            }}
                            className="w-3 h-3 text-primary"
                          />
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => {
                              const updated = [...aiParsedMCQs];
                              updated[idx].options[optIdx] = e.target.value;
                              setAiParsedMCQs(updated);
                            }}
                            className={`w-full text-[11px] bg-transparent border-b border-border/20 focus:border-primary focus:outline-none ${
                              q.correctIndex === optIdx ? "text-green-600 font-bold" : ""
                            }`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <Button
                type="button"
                className="w-full justify-center"
                loading={aiSaveLoading}
                onClick={async () => {
                  setAiSaveLoading(true);
                  setAiError("");
                  try {
                    const res = await fetch("/api/admin/mcqs/import/save", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        classRef,
                        subjectRef,
                        difficulty: aiDifficulty,
                        sourceDoc: aiFile ? `AI: ${aiFile.name}` : "AI: Document",
                        mcqs: aiParsedMCQs,
                      }),
                    });
                    const text = await res.text();
                    let data: any = {};
                    try {
                      data = JSON.parse(text);
                    } catch (jsonErr) {
                      setAiError(text.slice(0, 300) || `Server error (Status: ${res.status})`);
                      return;
                    }
                    if (res.ok) {
                      const newlyInsertedIds = data.insertedIds || [];
                      // Select them immediately
                      setSelectedMCQIds((prev) => [...prev, ...newlyInsertedIds]);
                      
                      // Refresh the available list
                      const params = new URLSearchParams({
                        classRef,
                        subjectRef,
                        limit: "200",
                      });
                      const listRes = await fetch(`/api/admin/mcqs?${params.toString()}`);
                      if (listRes.ok) {
                        const listData = await listRes.json();
                        setAvailableMCQs(listData.mcqs || []);
                      }

                      // Refresh sources list
                      const srcRes = await fetch("/api/admin/mcqs/sources");
                      if (srcRes.ok) {
                        const srcData = await srcRes.json();
                        setSourcesList(srcData.sources || []);
                      }

                      // Close Modal
                      setIsAIModalOpen(false);
                      setAiFile(null);
                      setAiParsedMCQs([]);
                    } else {
                      setAiError(data.error || "Failed to save questions.");
                    }
                  } catch (err: any) {
                    setAiError(err.message || "Connection error saving questions.");
                  } finally {
                    setAiSaveLoading(false);
                  }
                }}
              >
                Import to MCQ Bank & Auto-Select
              </Button>
            </div>
          )}
        </div>
      </Modal>
    </form>
  );
}

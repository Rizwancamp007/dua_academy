"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import {
  Clock,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Send,
  Flag,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from "lucide-react";

interface MCQData {
  _id: string;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation?: string;
  subjectName: string;
}

interface TestRunnerProps {
  testId: string;
  testTitle: string;
  durationMinutes: number;
  questions: MCQData[];
  mode: "test" | "practice";
}

export function StudentTestRunner({ testId, testTitle, durationMinutes, questions, mode }: TestRunnerProps) {
  const router = useRouter();

  // 1. Core States
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [visitedQuestions, setVisitedQuestions] = useState<Record<string, boolean>>({});
  const [tabWarnings, setTabWarnings] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(durationMinutes * 60);
  
  // Submit loading/success
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);

  const allowUnloadRef = useRef(false);

  // Prevent page refresh / back navigation alert during test
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (allowUnloadRef.current) return;
      e.preventDefault();
      e.returnValue = "Are you sure you want to exit the test? Your progress will be lost.";
      return e.returnValue;
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // Track visited questions
  useEffect(() => {
    if (questions.length > 0) {
      const qId = questions[currentIdx]._id;
      setVisitedQuestions((prev) => ({ ...prev, [qId]: true }));
    }
  }, [currentIdx, questions]);
  
  // Reference for timer/tab focus
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTime = useRef(Date.now());

  // 2. Tab Departure Monitor (Timed Test Mode Only)
  useEffect(() => {
    if (mode !== "test") return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabWarnings((prev) => {
          const next = prev + 1;
          if (next >= 3) {
            // Auto submit
            triggerAutoSubmit("Excessive tab switching");
          } else {
            setShowWarningModal(true);
          }
          return next;
        });
      }
    };

    const handleBlur = () => {
      // Small timeout to prevent false alerts on system popups
      setTimeout(() => {
        if (!document.hasFocus()) {
          setTabWarnings((prev) => {
            const next = prev + 1;
            if (next >= 3) {
              triggerAutoSubmit("Focus loss");
            } else {
              setShowWarningModal(true);
            }
            return next;
          });
        }
      }, 300);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
    };
  }, [mode]);

  // 3. Countdown Timer (Timed Test Mode Only)
  useEffect(() => {
    if (mode !== "test") return;

    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          triggerAutoSubmit("Time expired");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [mode]);

  // 4. Trigger auto-submit
  const triggerAutoSubmit = (reason: string) => {
    alert(`Test auto-submitted. Reason: ${reason}`);
    handleSubmitTest(true);
  };

  // 5. Submit Handler
  const handleSubmitTest = async (isAuto = false) => {
    if (submitting) return;
    setSubmitting(true);

    const durationUsed = Math.round((Date.now() - startTime.current) / 1000);
    
    // Format answers array (include skipped as -1 if not explicitly answered)
    const formattedAnswers = questions.map((q) => {
      const chosen = selectedAnswers[q._id];
      return {
        questionId: q._id,
        selectedOptionIndex: chosen !== undefined ? chosen : -1,
      };
    });

    try {
      allowUnloadRef.current = true;
      const response = await fetch("/api/student/tests/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testId,
          answers: formattedAnswers,
          tabSwitchWarnings: tabWarnings,
          durationSecondsUsed: durationUsed,
          mode,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        router.push(`/student/results`);
      } else {
        allowUnloadRef.current = false;
        alert(data.error || "Failed to submit test results.");
      }
    } catch (err) {
      allowUnloadRef.current = false;
      alert("Network error. Please try again.");
    } finally {
      setSubmitting(false);
      setShowSubmitModal(false);
    }
  };

  // Helper formatting timer
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  // Nav helpers
  const handleSelectOption = (optionIndex: number) => {
    const qId = questions[currentIdx]._id;
    
    // In practice mode, once answered, locking it is helpful or we let them update
    setSelectedAnswers({ ...selectedAnswers, [qId]: optionIndex });
  };

  const toggleReview = () => {
    const qId = questions[currentIdx]._id;
    setMarkedForReview({ ...markedForReview, [qId]: !markedForReview[qId] });
  };

  const nextQuestion = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const prevQuestion = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const currentQuestion = questions[currentIdx];
  const currentAnswer = selectedAnswers[currentQuestion._id];
  const isMarked = markedForReview[currentQuestion._id];

  const unansweredCount = questions.length - Object.keys(selectedAnswers).length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Left Panel (Top on Mobile): MCQ Viewer */}
      <div className="lg:col-span-3 order-1 lg:order-1 flex flex-col space-y-6">
        {/* Status bar */}
        <Card hoverLift={false} className="border border-border bg-surface px-6 py-4 flex items-center justify-between">
          <h3 className="font-serif font-bold text-text truncate max-w-sm">
            {testTitle}
          </h3>

          {mode === "test" && (
            <div className="flex items-center gap-4 text-sm font-semibold shrink-0">
              <div className="flex items-center gap-1.5 text-primary">
                <Clock className="w-4 h-4" />
                <span>Timer: {formatTime(secondsRemaining)}</span>
              </div>
              {tabWarnings > 0 && (
                <div className="flex items-center gap-1 text-yellow-600">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Warnings: {tabWarnings}/3</span>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Question Area */}
        <Card hoverLift={false} className="border border-border bg-surface p-8 min-h-[400px] flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <Badge variant="outline" className="uppercase text-[10px]">
              Question {currentIdx + 1} of {questions.length}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleReview}
              className={`flex items-center gap-1.5 text-xs cursor-pointer ${
                isMarked ? "text-yellow-600 hover:text-yellow-700 bg-yellow-500/5" : "text-text/60"
              }`}
            >
              <Flag className="w-4 h-4" /> {isMarked ? "Marked" : "Review Later"}
            </Button>
          </div>

          <h3 className="font-serif text-lg sm:text-xl font-bold mb-6 text-text leading-relaxed">
            {currentQuestion.questionText || currentQuestion.question}
          </h3>

          {currentQuestion.questionImage && (
            <div className="mb-6 rounded-xl overflow-hidden border border-border bg-surface/50 p-3 flex justify-center">
              <img
                src={currentQuestion.questionImage}
                alt="Question Diagram"
                className="max-h-72 w-auto object-contain rounded-lg"
              />
            </div>
          )}

          {/* Options List */}
          <div className="space-y-4 mb-8">
            {currentQuestion.options.map((opt, oIdx) => {
              const isSelected = currentAnswer === oIdx;
              
              // In Practice Mode: reveal correctness instantly
              let optionStyles = "border-border hover:border-primary/45 bg-surface";
              let badge = null;

              if (mode === "practice" && currentAnswer !== undefined) {
                const isCorrect = oIdx === currentQuestion.correctOptionIndex;
                const isStudentChoice = currentAnswer === oIdx;
                
                if (isCorrect) {
                  optionStyles = "border-green-500 bg-green-500/5 ring-1 ring-green-500";
                  badge = <CheckCircle2 className="w-4.5 h-4.5 text-green-500 shrink-0" />;
                } else if (isStudentChoice) {
                  optionStyles = "border-red-500 bg-red-500/5 ring-1 ring-red-500";
                  badge = <XCircle className="w-4.5 h-4.5 text-red-500 shrink-0" />;
                }
              } else if (isSelected) {
                optionStyles = "border-primary bg-primary/5 ring-1 ring-primary";
              }

              return (
                <button
                  key={oIdx}
                  type="button"
                  onClick={() => handleSelectOption(oIdx)}
                  className={`w-full flex items-center justify-between gap-4 p-4 rounded-xl border text-left text-sm font-medium transition-all cursor-pointer ${optionStyles}`}
                  disabled={mode === "practice" && currentAnswer !== undefined}
                >
                  <span className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-border/40 text-text/70 flex items-center justify-center font-bold text-xs shrink-0">
                      {String.fromCharCode(65 + oIdx)}
                    </span>
                    <span>{opt}</span>
                  </span>
                  {badge}
                </button>
              );
            })}
          </div>

          {/* Explanation Area (Practice Mode Only) */}
          {mode === "practice" && currentAnswer !== undefined && currentQuestion.explanation && (
            <div className="p-4 rounded-xl bg-primary/5 border border-border/80 text-xs text-text/80 leading-relaxed mb-6 animate-fade-in">
              <span className="font-bold block mb-1">Explanation:</span>
              {currentQuestion.explanation}
            </div>
          )}

          {/* Pagination buttons */}
          <div className="flex items-center justify-between border-t border-border/50 pt-6 mt-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={prevQuestion}
              disabled={currentIdx === 0}
              className="flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={nextQuestion}
              disabled={currentIdx === questions.length - 1}
              className="flex items-center gap-1 cursor-pointer"
            >
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      </div>

      {/* Right Panel (Bottom on Mobile): Question Grid & Controls */}
      <div className="lg:col-span-1 order-2 lg:order-2 flex flex-col space-y-6">
        <Card hoverLift={false} className="border border-border bg-surface p-6">
          <div className="flex items-center justify-between mb-4 border-b border-border/50 pb-2">
            <h4 className="font-serif font-bold text-sm">Question Grid</h4>
            <Badge variant={mode === "test" ? "primary" : "secondary"} className="uppercase text-[10px]">
              {mode} Mode
            </Badge>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {questions.map((q, idx) => {
              const answered = selectedAnswers[q._id] !== undefined;
              const visited = visitedQuestions[q._id];
              const review = markedForReview[q._id];
              const isCurrent = idx === currentIdx;

              let btnStyles = "border-border text-text/40 bg-transparent hover:bg-border/20";
              if (visited && !answered) btnStyles = "bg-amber-500/10 text-amber-600 border-amber-500/30";
              if (answered) btnStyles = "bg-green-500/10 text-green-600 border-green-500/30";
              if (review) btnStyles = "bg-yellow-500/20 text-yellow-600 border-yellow-500/50";
              if (isCurrent) {
                btnStyles = "bg-primary text-white border-primary shadow-sm shadow-primary/20 ring-2 ring-primary/30";
              }

              return (
                <button
                  key={q._id}
                  onClick={() => setCurrentIdx(idx)}
                  className={`w-10 h-10 rounded-lg text-xs font-semibold border transition-all flex items-center justify-center cursor-pointer ${btnStyles}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Legend Details */}
          <div className="space-y-2 mt-6 pt-4 border-t border-border/50 text-[11px] text-text/60">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-primary" />
              <span>Current Question</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-500/10 border border-green-500/30" />
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-amber-500/10 border border-amber-500/30" />
              <span>Skipped / Visited</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-yellow-500/20 border border-yellow-500/50" />
              <span>Marked for Review</span>
            </div>
          </div>
        </Card>

        {/* Action Controls */}
        <Button
          onClick={() => setShowSubmitModal(true)}
          className="w-full flex items-center justify-center gap-2 cursor-pointer bg-primary hover:bg-primary/95 text-white"
        >
          <Send className="w-4 h-4" /> Submit Assessment
        </Button>
      </div>

      {/* 3. Submit confirmation modal */}
      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title="Submit Assessment?"
      >
        <div className="space-y-4 text-center">
          {unansweredCount > 0 ? (
            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-600 text-xs font-semibold flex items-center gap-2 text-left mb-2">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <div>
                <span><strong>WARNING:</strong> You have <strong>{unansweredCount}</strong> unanswered questions.</span>
                <span className="block font-normal mt-0.5">Remaining unsubmitted questions will be marked as Skipped (0 score).</span>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-600 text-xs font-semibold flex items-center gap-2 text-left mb-2">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>Great job! You have answered all {questions.length} questions.</span>
            </div>
          )}

          <p className="text-sm text-text/75 leading-relaxed">
            Are you sure you want to finish and submit your test answers? You have answered{" "}
            <strong>{Object.keys(selectedAnswers).length}</strong> out of{" "}
            <strong>{questions.length}</strong> questions.
          </p>

          {submitting && (
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-600 text-xs font-semibold text-center animate-pulse">
              Submitting test... This might take 10-15 seconds. Please wait and do not close or reload this page.
            </div>
          )}

          <div className="flex gap-4 max-w-xs mx-auto pt-4">
            <Button onClick={() => handleSubmitTest(false)} loading={submitting} className="flex-grow justify-center cursor-pointer">
              Yes, Submit
            </Button>
            <Button variant="outline" onClick={() => setShowSubmitModal(false)} className="flex-grow justify-center cursor-pointer">
              No, Resume
            </Button>
          </div>
        </div>
      </Modal>

      {/* 4. Tab Departure Warning Modal */}
      <Modal
        isOpen={showWarningModal}
        onClose={() => setShowWarningModal(false)}
        title="Tab focus warning!"
      >
        <div className="text-center py-4 space-y-4">
          <div className="flex justify-center text-yellow-600">
            <AlertTriangle className="w-12 h-12" />
          </div>
          <h3 className="font-serif text-lg font-bold">Please stay on this tab</h3>
          <p className="text-sm text-text/75 max-w-sm mx-auto leading-relaxed">
            Your tab departures are monitored to maintain mock integrity. Departure:{" "}
            <strong>{tabWarnings}/3</strong>. 3 warnings will result in automatic submission.
          </p>
          <Button onClick={() => setShowWarningModal(false)} className="mx-auto block cursor-pointer">
            I Understand, Resume Test
          </Button>
        </div>
      </Modal>
    </div>
  );
}
export default StudentTestRunner;

"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, XCircle, ChevronLeft, Award, Clock, AlertTriangle, Eye, HelpCircle } from "lucide-react";
import Link from "next/link";

interface ReviewQuestion {
  id: string;
  questionText: string;
  questionImage?: string;
  options: string[];
  correctOptionIndex: number;
  selectedOptionIndex: number;
  isCorrect: boolean;
  explanation?: string;
}

interface ResultDetailProps {
  testTitle: string;
  subject: string;
  correctCount: number;
  totalCount: number;
  percentage: number;
  warnings: number;
  durationSeconds: number;
  mode: string;
  questions: ReviewQuestion[];
  showAnswersAtEnd?: boolean;
}

export function StudentResultDetailView({
  testTitle,
  subject,
  correctCount,
  totalCount,
  percentage,
  warnings,
  durationSeconds,
  mode,
  questions,
  showAnswersAtEnd = true,
}: ResultDetailProps) {
  const [filter, setFilter] = useState<"all" | "correct" | "incorrect">("all");

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Do not refresh the results page. Save or print the page if needed.";
      return e.returnValue;
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const filteredQuestions = questions.filter((q) => {
    if (filter === "correct") return q.isCorrect;
    if (filter === "incorrect") return !q.isCorrect;
    return true;
  });

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rSecs = secs % 60;
    return `${mins}m ${rSecs}s`;
  };

  return (
    <div className="space-y-8">
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          /* Hide admin sidebar/navbars, footers, buttons */
          .print\\:hidden,
          nav,
          aside,
          footer,
          button,
          .no-print {
            display: none !important;
          }
          /* Clean up shadows/borders for print */
          .card,
          .border,
          div {
            box-shadow: none !important;
          }
          main, .max-w-7xl {
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
          }
        }
      `}</style>

      {/* Back Button & Print Action */}
      <div className="flex justify-between items-center print:hidden gap-4">
        <Link href="/student/results">
          <Button variant="outline" size="sm" className="flex items-center gap-1.5 cursor-pointer">
            <ChevronLeft className="w-4 h-4" /> Back to Results
          </Button>
        </Link>

        <Button
          variant="outline"
          size="sm"
          onClick={() => window.print()}
          className="flex items-center gap-1.5 cursor-pointer border-primary/40 text-primary hover:bg-primary/5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print Result
        </Button>
      </div>

      {/* Summary Score Card */}
      <Card hoverLift={false} className="border border-border bg-surface p-8 shadow-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center md:text-left">
            <Badge variant="primary" className="mb-2">{subject}</Badge>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-text">
              {testTitle}
            </h2>
            <p className="text-sm text-text/60">
              Completed as <strong className="uppercase">{mode}</strong> mode.
            </p>
          </div>

          {/* Circle Score representation */}
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24 rounded-full border-4 border-primary/20 flex flex-col items-center justify-center shrink-0">
              <span className="text-2xl font-bold text-primary dark:text-secondary">{percentage}%</span>
              <span className="text-[10px] text-text/50 font-semibold uppercase">Score</span>
            </div>
            
            <div className="space-y-1.5 text-sm text-text/75">
              <div className="flex items-center gap-2">
                <Award className="w-4.5 h-4.5 text-primary" />
                <span>Correct: <strong>{correctCount}</strong> / {totalCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4.5 h-4.5 text-text/60" />
                <span>Time Used: {formatDuration(durationSeconds)}</span>
              </div>
              {warnings > 0 && (
                <div className="flex items-center gap-2 text-yellow-600 font-semibold">
                  <AlertTriangle className="w-4.5 h-4.5" />
                  <span>Tab Departures: {warnings}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Filter Tabs */}
      {showAnswersAtEnd && (
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex gap-2">
            {(["all", "correct", "incorrect"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 text-sm font-semibold capitalize rounded-lg transition-all cursor-pointer ${
                  filter === type
                    ? "bg-primary text-white"
                    : "text-text/65 hover:bg-border/20 hover:text-text"
                }`}
              >
                {type} ({type === "all" ? questions.length : type === "correct" ? questions.filter(q => q.isCorrect).length : questions.filter(q => !q.isCorrect).length})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Questions list */}
      <div className="space-y-6">
        {(showAnswersAtEnd ? filteredQuestions : questions).length > 0 ? (
          (showAnswersAtEnd ? filteredQuestions : questions).map((q, idx) => (
            <Card key={q.id} hoverLift={false} className="border border-border bg-surface p-6 space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-[10px]">
                  Question {idx + 1}
                </Badge>
                {q.selectedOptionIndex === -1 ? (
                  <Badge variant="warning" className="flex items-center gap-1 bg-amber-500/10 text-amber-500 border-amber-500/25">
                    <HelpCircle className="w-3.5 h-3.5" /> Skipped
                  </Badge>
                ) : showAnswersAtEnd ? (
                  q.isCorrect ? (
                    <Badge variant="success" className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                    </Badge>
                  ) : (
                    <Badge variant="danger" className="flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> Incorrect
                    </Badge>
                  )
                ) : (
                  <Badge variant="outline" className="flex items-center gap-1 bg-primary/5 text-primary border-primary/20">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Answered
                  </Badge>
                )}
              </div>

              <h4 className="font-serif font-bold text-text leading-relaxed">
                {q.questionText}
              </h4>

              {q.questionImage && (
                <div className="my-3 rounded-lg overflow-hidden border border-border/80 bg-surface/50 p-2 flex justify-center">
                  <img
                    src={q.questionImage}
                    alt="Question Diagram"
                    className="max-h-60 w-auto object-contain rounded"
                  />
                </div>
              )}

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {q.options.map((opt, oIdx) => {
                  const isCorrectAnswer = oIdx === q.correctOptionIndex;
                  const isSelectedAnswer = oIdx === q.selectedOptionIndex;

                  let borderStyle = "border-border/60 text-text/60";
                  let indicator = null;

                  if (showAnswersAtEnd) {
                    if (isCorrectAnswer) {
                      borderStyle = "border-green-500 bg-green-500/5 text-green-700 font-bold ring-1 ring-green-500";
                      indicator = <CheckCircle2 className="w-4 h-4 text-green-500" />;
                    } else if (isSelectedAnswer && q.selectedOptionIndex !== -1 && !q.isCorrect) {
                      borderStyle = "border-red-500 bg-red-500/5 text-red-700 font-bold ring-1 ring-red-500";
                      indicator = <XCircle className="w-4 h-4 text-red-500" />;
                    }
                  } else {
                    if (isSelectedAnswer) {
                      borderStyle = "border-primary bg-primary/5 text-primary font-bold ring-1 ring-primary";
                      indicator = <CheckCircle2 className="w-4 h-4 text-primary" />;
                    }
                  }

                  return (
                    <div
                      key={oIdx}
                      className={`flex items-center justify-between p-3 rounded-lg border text-sm ${borderStyle}`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-5.5 h-5.5 rounded-full bg-border/40 text-text/60 flex items-center justify-center font-bold text-[10px]">
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        <span>{opt}</span>
                      </span>
                      {indicator}
                    </div>
                  );
                })}
              </div>

              {/* Explanation section */}
              {showAnswersAtEnd && q.explanation && (
                <div className="p-4 rounded-lg bg-primary/5 border border-border/80 text-xs text-text/80 leading-relaxed mt-4 flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <strong className="block mb-1">Answer Explanation:</strong>
                    {q.explanation}
                  </div>
                </div>
              )}
            </Card>
          ))
        ) : (
          <div className="text-center py-12 border border-dashed border-border rounded-xl text-text/60 bg-surface">
            No questions match this filter.
          </div>
        )}
      </div>
    </div>
  );
}
export default StudentResultDetailView;

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { FileText, Clock, HelpCircle, AlertCircle, PlayCircle, BookOpen } from "lucide-react";

interface TestData {
  _id: string;
  title: string;
  description: string;
  subjectName: string;
  durationMinutes: number;
  totalQuestionsCount: number;
  modeSupport: "both" | "practice" | "test";
  startTime?: string | null;
  endTime?: string | null;
}

export function StudentTestsView({ tests }: { tests: TestData[] }) {
  const router = useRouter();
  const [selectedTest, setSelectedTest] = useState<TestData | null>(null);
  const [mode, setMode] = useState<"test" | "practice">("test");

  const handleStart = () => {
    if (!selectedTest) return;
    router.push(`/student/tests/${selectedTest._id}?mode=${mode}`);
    setSelectedTest(null);
  };

  return (
    <div className="space-y-8">
      {tests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tests.map((test) => {
            const now = new Date();
            const start = test.startTime ? new Date(test.startTime) : null;
            const end = test.endTime ? new Date(test.endTime) : null;

            const isLockedYet = start ? now < start : false;
            const isClosedAlready = end ? now > end : false;
            const isDisabled = isLockedYet || isClosedAlready;

            return (
              <Card
                key={test._id}
                hoverLift={!isDisabled}
                className={`flex flex-col h-full border border-border transition-all ${
                  isDisabled ? "opacity-60 bg-surface/40 select-none" : ""
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-4">
                  <Badge variant="primary">{test.subjectName}</Badge>
                  <span className="flex items-center gap-1 text-xs text-text/60">
                    <Clock className="w-3.5 h-3.5" />
                    {test.durationMinutes} mins
                  </span>
                </div>

                <h4 className="font-serif text-lg font-bold mb-2">
                  {test.title}
                </h4>
                
                <p className="text-sm text-text/75 line-clamp-3 mb-6 leading-relaxed">
                  {test.description}
                </p>

                <div className="mt-auto pt-4 border-t border-border/50 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-text/60 flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-primary" />
                      {test.totalQuestionsCount} Questions
                    </span>
                    
                    {!isDisabled && (
                      <Button
                        size="sm"
                        onClick={() => {
                          if (test.modeSupport === "practice") {
                            setMode("practice");
                          } else {
                            setMode("test");
                          }
                          setSelectedTest(test);
                        }}
                        className="flex items-center gap-1.5 cursor-pointer"
                      >
                        <PlayCircle className="w-4 h-4" /> Start
                      </Button>
                    )}
                  </div>

                  {isLockedYet && (
                    <div className="text-xs font-semibold text-amber-500 bg-amber-500/10 px-3 py-2 rounded-lg border border-amber-500/20 text-center w-full">
                      Opens: {start ? start.toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : ""}
                    </div>
                  )}

                  {isClosedAlready && (
                    <div className="text-xs font-semibold text-red-500 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20 text-center w-full">
                      Expired / Closed
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-border rounded-2xl bg-surface max-w-xl mx-auto">
          <FileText className="w-16 h-16 text-text/20 mx-auto mb-4" />
          <h3 className="font-serif text-xl font-bold mb-2">No Tests Available</h3>
          <p className="text-sm text-text/60">
            There are no active tests matching your class enrollment at this moment.
          </p>
        </div>
      )}

      {/* Start Test Mode Selection Modal */}
      <Modal
        isOpen={!!selectedTest}
        onClose={() => setSelectedTest(null)}
        title="Select Assessment Mode"
      >
        {selectedTest && (
          <div className="space-y-6 py-2">
            <div className="p-3 bg-primary/5 rounded-lg border border-border/80 text-xs font-mono text-text/60 text-center">
              Selected: {selectedTest.title}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Timed Mode Option */}
              <button
                type="button"
                onClick={() => setMode("test")}
                className={`p-4 rounded-xl border text-left flex flex-col space-y-2 cursor-pointer transition-all ${
                  mode === "test"
                    ? "border-primary bg-primary/5 ring-2 ring-primary/25"
                    : "border-border bg-surface hover:border-primary/45"
                }`}
                disabled={selectedTest.modeSupport === "practice"}
              >
                <div className="flex items-center gap-2 font-bold">
                  <Clock className="w-5 h-5 text-primary" /> Timed Test Mode
                </div>
                <p className="text-xs text-text/70 leading-relaxed">
                  Strict timer, tabs tracking is enabled (auto-submits on repeated departures), answers revealed only after submission.
                </p>
              </button>

              {/* Practice Mode Option */}
              <button
                type="button"
                onClick={() => setMode("practice")}
                className={`p-4 rounded-xl border text-left flex flex-col space-y-2 cursor-pointer transition-all ${
                  mode === "practice"
                    ? "border-primary bg-primary/5 ring-2 ring-primary/25"
                    : "border-border bg-surface hover:border-primary/45"
                }`}
                disabled={selectedTest.modeSupport === "test"}
              >
                <div className="flex items-center gap-2 font-bold">
                  <HelpCircle className="w-5 h-5 text-secondary" /> Practice Mode
                </div>
                <p className="text-xs text-text/70 leading-relaxed">
                  No strict timer, instant color-coded answer feedback on choices, view explanations immediately, tab tracking disabled.
                </p>
              </button>
            </div>

            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 text-text space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-amber-500">
                <AlertCircle className="w-5 h-5 shrink-0" />
                Assessment Instructions & Guidelines
              </div>
              <ul className="text-xs space-y-1.5 list-disc pl-4 text-text/80 leading-relaxed">
                <li>
                  <strong>Complete within time:</strong> Ensure you complete and submit the test within the allocated <strong>{selectedTest.durationMinutes} minutes</strong> limit.
                </li>
                <li>
                  <strong>Do not switch tabs:</strong> In Timed Mode, changing browser tabs, opening other apps, or losing window focus is strictly monitored and will trigger automatic test submission.
                </li>
                <li>
                  <strong>Do not refresh the page:</strong> Refreshing the page during a test, during submission, or on the results page will disrupt the tracking flow.
                </li>
                <li>
                  <strong>Do not leave inactive:</strong> Do not leave the test inactive for longer than your system's screen-off time. Lock screens or system sleep will disconnect the session.
                </li>
                <li>
                  <strong>Submission Delay:</strong> Submission might take 10-15 seconds to parse and save grades. <strong>Please wait a while</strong> and do not close or reload the browser.
                </li>
              </ul>
            </div>

            <div className="flex gap-4">
              <Button onClick={handleStart} className="flex-1">
                Confirm & Start Assessment
              </Button>
              <Button variant="outline" onClick={() => setSelectedTest(null)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
export default StudentTestsView;

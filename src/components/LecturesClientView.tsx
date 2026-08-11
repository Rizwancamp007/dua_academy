"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Video, ExternalLink, Lock, Search } from "lucide-react";

interface LectureData {
  _id: string;
  title: string;
  isPublicDemo: boolean;
  sourceType: string;
  url: string;
  classRef?: { name: string } | null;
  streamRef?: { name: string } | null;
  subjectRef?: { name: string } | null;
}

interface LecturesClientViewProps {
  initialLectures: LectureData[];
}

const getSubjectDisplayName = (name: string) => {
  if (!name) return "";
  const n = name.trim().toLowerCase();
  if (n === "mathematics" || n === "maths") return "Math";
  if (n === "logical reasoning" || n === "logical-reasoning") return "LR";
  return name;
};

export default function LecturesClientView({ initialLectures }: LecturesClientViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeStream, setActiveStream] = useState("All");
  const [activeSubject, setActiveSubject] = useState("All");

  // Dynamic lists from database records
  const streams = ["All", ...Array.from(new Set(initialLectures.map((l) => l.streamRef?.name).filter((name): name is string => !!name)))];
  
  const rawSubjects = Array.from(new Set(initialLectures.map((l) => l.subjectRef?.name).filter((sub): sub is string => !!sub)));
  const mappedSubjects = rawSubjects.map(getSubjectDisplayName);
  const mandatorySubjects = ["Physics", "Chemistry", "Biology", "English", "Math", "LR"];
  const subjects = ["All", ...Array.from(new Set([...mandatorySubjects, ...mappedSubjects]))];

  // Filtering logic
  const filteredLectures = initialLectures.filter((lec) => {
    const matchesSearch = lec.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    const streamName = lec.streamRef?.name || "";
    const matchesStream = activeStream === "All" || streamName === activeStream;

    const subjectName = lec.subjectRef?.name || "";
    const matchesSubject = activeSubject === "All" || getSubjectDisplayName(subjectName) === activeSubject;

    return matchesSearch && matchesStream && matchesSubject;
  });

  return (
    <div className="space-y-8">
      {/* Search and Filters Card */}
      <div className="bg-surface border border-border p-6 rounded-2xl space-y-6 shadow-sm">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text/40 w-4 h-4" />
          <input
            type="text"
            placeholder="Search lectures by topic or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-bg border border-border rounded-xl text-sm focus:outline-none focus:border-primary text-text placeholder-text/40 transition-colors"
          />
        </div>

        {/* Stream Filter Buttons */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-text/50">Filter by Stream</span>
          <div className="flex flex-wrap gap-2">
            {streams.map((stream) => {
              const isActive = activeStream === stream;
              return (
                <button
                  key={stream}
                  onClick={() => setActiveStream(stream)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    isActive
                      ? "bg-primary text-[#1A1A1A] border-primary font-bold shadow-sm shadow-primary/20"
                      : "bg-surface text-text/80 border-border hover:border-text/30"
                  }`}
                >
                  {stream}
                </button>
              );
            })}
          </div>
        </div>

        {/* Subject Filter Buttons */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-text/50">Filter by Subject</span>
          <div className="flex flex-wrap gap-2">
            {subjects.map((sub) => {
              const isActive = activeSubject === sub;
              return (
                <button
                  key={sub}
                  onClick={() => setActiveSubject(sub)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    isActive
                      ? "bg-secondary text-[#1A1A1A] border-secondary font-bold shadow-sm shadow-secondary/20"
                      : "bg-surface text-text/80 border-border hover:border-text/30"
                  }`}
                >
                  {sub}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Lectures Grid */}
      {filteredLectures.length === 0 ? (
        <div className="py-20 text-center text-text/60 bg-surface border border-border rounded-2xl max-w-xl mx-auto space-y-4">
          <Video className="w-12 h-12 mx-auto text-text/30" />
          <h3 className="text-lg font-serif font-bold text-text">No Matching Lectures</h3>
          <p className="text-xs max-w-xs mx-auto text-text/60">
            No lectures match your current search query or active filter settings. Try adjusting your filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredLectures.map((lec) => {
            const isLocked = !lec.isPublicDemo;

            // Parse YouTube embed
            let videoEmbedUrl = "";
            if (!isLocked && lec.sourceType === "youtube") {
              const ytMatch = lec.url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
              if (ytMatch && ytMatch[1]) {
                videoEmbedUrl = `https://www.youtube.com/embed/${ytMatch[1]}`;
              }
            }

            return (
              <Card key={lec._id} className="border border-border bg-surface overflow-hidden flex flex-col justify-between h-full relative group">
                <div>
                  {/* Media Preview / Embed */}
                  {isLocked ? (
                    <div className="aspect-video w-full bg-slate-900 flex flex-col items-center justify-center text-center p-4 border-b border-border/50 relative overflow-hidden">
                      <Lock className="w-8 h-8 text-amber-500 mb-2" />
                      <span className="text-xs font-semibold text-text/80">Premium content locked</span>
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-4 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 space-y-3">
                        <span className="text-sm font-bold text-amber-400">Premium Content</span>
                        <span className="text-xs text-slate-300">Please register or log in first to watch this lecture.</span>
                        <Link href="/register">
                          <Button size="sm" className="font-bold text-xs bg-amber-500 hover:bg-amber-600 text-slate-900 border-0">
                            Register Now
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ) : videoEmbedUrl ? (
                    <div className="aspect-video w-full">
                      <iframe
                        src={videoEmbedUrl}
                        title={lec.title}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div className="aspect-video w-full bg-bg flex flex-col items-center justify-center text-center p-4 border-b border-border/50">
                      <Video className="w-8 h-8 text-primary mb-2" />
                      <span className="text-xs font-semibold text-text/80">{lec.sourceType.toUpperCase()} Lecture</span>
                      <a
                        href={lec.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 mt-2 text-xs text-primary hover:underline font-bold"
                      >
                        Open Lecture Link <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}

                  {/* Metadata & Title */}
                  <div className="p-5 space-y-3">
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider">
                        {lec.classRef?.name || "General"}
                      </Badge>
                      {lec.streamRef && (
                        <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider">
                          {lec.streamRef.name}
                        </Badge>
                      )}
                      <Badge variant="warning" className="text-[10px] uppercase font-bold tracking-wider">
                        {getSubjectDisplayName(lec.subjectRef?.name || "")}
                      </Badge>
                      {isLocked ? (
                        <Badge variant="danger" className="text-[10px] uppercase font-bold tracking-wider bg-amber-500/10 text-amber-500 border-amber-500/20">
                          Premium
                        </Badge>
                      ) : (
                        <Badge variant="success" className="text-[10px] uppercase font-bold tracking-wider bg-green-500/10 text-green-500 border-green-500/20">
                          Free Trial
                        </Badge>
                      )}
                    </div>

                    <h3 className="font-serif font-bold text-lg text-text leading-snug">
                      {lec.title}
                    </h3>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

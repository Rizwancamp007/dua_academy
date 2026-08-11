"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Play, Lock, Search, Filter, MessageCircle, ExternalLink, ShieldAlert } from "lucide-react";

interface LectureData {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  platform: string;
  classId: string;
  subjectId: string;
  streamName?: string;
  chapterId?: string;
}

interface StudentLecturesViewProps {
  lectures: LectureData[];
  studentClass: string;
  studentEmail: string;
}

const getSubjectDisplayName = (name: string) => {
  if (!name) return "";
  const n = name.trim().toLowerCase();
  if (n === "mathematics" || n === "maths") return "Math";
  if (n === "logical reasoning" || n === "logical-reasoning") return "LR";
  return name;
};

export function StudentLecturesView({ lectures, studentClass, studentEmail }: StudentLecturesViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStream, setSelectedStream] = useState("All");
  const [selectedSubject, setSelectedSubject] = useState("All");
  
  // Modal states
  const [activeLecture, setActiveLecture] = useState<LectureData | null>(null);
  const [lockModalLecture, setLockModalLecture] = useState<LectureData | null>(null);

  // Extract unique streams and subjects
  const streams = ["All", ...Array.from(new Set(lectures.map((l) => l.streamName || "General").filter(Boolean)))];
  
  const rawSubjects = Array.from(new Set(lectures.map((l) => l.subjectId).filter(Boolean)));
  const mappedSubjects = rawSubjects.map(getSubjectDisplayName);
  const mandatorySubjects = ["Physics", "Chemistry", "Biology", "English", "Math", "LR"];
  const subjects = ["All", ...Array.from(new Set([...mandatorySubjects, ...mappedSubjects]))];

  // Helper to check if lecture is locked (locks if class doesn't match student's class)
  const isLectureLocked = (lecture: LectureData) => {
    return false;
  };

  // Filter lectures based on search, stream and subject
  const filteredLectures = lectures.filter((lecture) => {
    const matchesSearch =
      lecture.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lecture.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const streamName = lecture.streamName || "General";
    const matchesStream = selectedStream === "All" || streamName === selectedStream;

    const matchesSubject = selectedSubject === "All" || getSubjectDisplayName(lecture.subjectId) === selectedSubject;
    
    return matchesSearch && matchesStream && matchesSubject;
  });

  const getEmbedUrl = (url: string, platform: string) => {
    if (platform === "youtube") {
      // Parse youtube id
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      if (match && match[2].length === 11) {
        return `https://www.youtube.com/embed/${match[2]}`;
      }
    }
    return url;
  };

  const handleLectureClick = (lecture: LectureData) => {
    if (isLectureLocked(lecture)) {
      setLockModalLecture(lecture);
    } else {
      setActiveLecture(lecture);
    }
  };

  const handleWhatsAppRequest = (lecture: LectureData) => {
    const message = `Assalam-o-Alaikum, I am registered at Duaa Academy using: ${studentEmail}. I want to request access for the locked lecture: "${lecture.title}" of Class: "${lecture.classId}".`;
    window.open(`https://wa.me/923335524440?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <div className="space-y-8">
      {/* Search and Filter Panel */}
      <div className="bg-surface p-6 rounded-xl border border-border space-y-6">
        <div>
          <Input
            label="Search Lectures"
            placeholder="Search by topic, keyword, or chapter..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        
        {/* Stream Filters */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-text/50">Filter by Stream</span>
          <div className="flex flex-wrap gap-2">
            {streams.map((stream) => {
              const isActive = selectedStream === stream;
              return (
                <button
                  key={stream}
                  onClick={() => setSelectedStream(stream)}
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

        {/* Subject Filters */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-text/50">Filter by Subject</span>
          <div className="flex flex-wrap gap-2">
            {subjects.map((sub) => {
              const isActive = selectedSubject === sub;
              return (
                <button
                  key={sub}
                  onClick={() => setSelectedSubject(sub)}
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
      {filteredLectures.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLectures.map((lecture) => {
            const locked = isLectureLocked(lecture);
            return (
              <Card
                key={lecture._id}
                hoverLift={true}
                clickable={true}
                onClick={() => handleLectureClick(lecture)}
                className={`relative flex flex-col h-full border ${
                  locked ? "border-border/60 opacity-90" : "border-border hover:border-primary/20"
                }`}
              >
                {/* Play/Lock Icon Overlay */}
                <div className="relative aspect-video w-full rounded-t-lg bg-primary/5 border-b border-border flex items-center justify-center overflow-hidden">
                  {locked ? (
                    <div className="flex flex-col items-center gap-2 text-text/40">
                      <Lock className="w-10 h-10" />
                      <span className="text-xs font-semibold">Locked</span>
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 fill-current ml-0.5" />
                    </div>
                  )}
                  {/* Platform Indicator */}
                  <Badge variant="outline" className="absolute bottom-2 right-2 uppercase bg-surface/90 text-[10px]">
                    {lecture.platform}
                  </Badge>
                  {/* Subject Tag */}
                  <Badge variant="primary" className="absolute top-2 left-2">
                    {getSubjectDisplayName(lecture.subjectId)}
                  </Badge>
                </div>

                <div className="p-5 flex flex-col flex-grow">
                  <span className="text-xs font-bold text-text/50 uppercase tracking-wider mb-1">
                    Class {lecture.classId}
                  </span>
                  
                  <h4 className="font-serif text-lg font-bold mb-2 line-clamp-1">
                    {lecture.title}
                  </h4>
                  
                  <p className="text-sm text-text/70 line-clamp-2 mb-4 leading-relaxed">
                    {lecture.description}
                  </p>
                  
                  <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between text-xs">
                    <span className="font-medium text-text/50">
                      Chapter: {lecture.chapterId || "Introductory"}
                    </span>
                    <span className="font-semibold text-primary dark:text-secondary">
                      {locked ? "Access Required" : "Watch Lecture →"}
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-border rounded-2xl bg-surface">
          <Search className="w-16 h-16 text-text/20 mx-auto mb-4" />
          <h3 className="font-serif text-xl font-bold mb-2">No Lectures Found</h3>
          <p className="text-sm text-text/60">
            No active lectures matched your search query or subject filters.
          </p>
        </div>
      )}

      {/* Play Video Modal */}
      <Modal
        isOpen={!!activeLecture}
        onClose={() => setActiveLecture(null)}
        title={activeLecture?.title || "Video Lecture"}
      >
        {activeLecture && (
          <div className="space-y-4">
            <div className="aspect-video w-full rounded-lg overflow-hidden border border-border bg-black relative">
              {activeLecture.platform === "youtube" ? (
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={getEmbedUrl(activeLecture.videoUrl, activeLecture.platform)}
                  title={activeLecture.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white">
                  <ShieldAlert className="w-12 h-12 text-secondary mb-3 animate-bounce" />
                  <h4 className="font-serif text-lg font-bold mb-2">External Lecture Stream</h4>
                  <p className="text-xs text-white/70 max-w-sm mb-6">
                    This lecture is hosted on {activeLecture.platform.toUpperCase()} and must be loaded externally.
                  </p>
                  <a
                    href={activeLecture.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="flex items-center gap-2 !bg-secondary !text-[#1A1A1A]">
                      Open External Link <ExternalLink className="w-4 h-4" />
                    </Button>
                  </a>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <Badge variant="primary">{activeLecture.subjectId}</Badge>
                <Badge variant="outline">Class {activeLecture.classId}</Badge>
              </div>
              <p className="text-sm text-text/80 leading-relaxed mt-2">
                {activeLecture.description}
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* Lock Notice Modal */}
      <Modal
        isOpen={!!lockModalLecture}
        onClose={() => setLockModalLecture(null)}
        title="Lecture Locked"
      >
        {lockModalLecture && (
          <div className="text-center py-4 space-y-6">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-red-500/10 text-red-500">
                <Lock className="w-12 h-12" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-serif text-xl font-bold">Class Level Restriction</h3>
              <p className="text-sm text-text/70 max-w-md mx-auto leading-relaxed">
                Assalam-o-Alaikum! This lecture is designated for students enrolled in **Class {lockModalLecture.classId}**, while your current account is enrolled in **Class {studentClass}**. 
              </p>
            </div>

            <div className="p-3 bg-primary/5 rounded-lg border border-border/80 text-xs font-mono text-text/60">
              Lecture Title: {lockModalLecture.title}
            </div>

            <div className="flex flex-col gap-3 max-w-sm mx-auto">
              <Button
                onClick={() => handleWhatsAppRequest(lockModalLecture)}
                className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 !text-white border-0"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                Request Access on WhatsApp
              </Button>
              <Button
                variant="outline"
                onClick={() => setLockModalLecture(null)}
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
export default StudentLecturesView;

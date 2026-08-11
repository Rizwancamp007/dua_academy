import dbConnect from "@/lib/dbConnect";
import Faculty from "@/models/Faculty";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { BookOpen, Calendar, GraduationCap } from "lucide-react";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function FacultyPage() {
  await dbConnect();
  
  // Fetch active faculty from DB, ordered by 'order'
  const facultyMembers = await Faculty.find({ isActive: true }).sort({ order: 1 }).lean();

  return (
    <div className="py-20 bg-bg text-text">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="primary" className="mb-3">Expert Faculty</Badge>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold mb-4">
            Meet Our Subject Specialists
          </h1>
          <p className="text-lg text-text/70">
            Learn from Mirpur Mathelo's most distinguished instructors, committed to turning complex syllabuses into simple, digestible concepts.
          </p>
        </div>

        {/* Faculty Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {facultyMembers.map((member: any) => (
            <Card key={member._id.toString()} hoverLift={true} className="flex flex-col h-full !p-0 overflow-hidden">
              {/* Faculty Image / Placeholder */}
              <div className="relative w-full h-64 bg-primary/5 border-b border-border">
                {member.imageUrl && !member.imageUrl.includes("placeholder.jpg") ? (
                  <Image
                    src={member.imageUrl}
                    alt={member.name}
                    fill
                    className="object-cover"
                    sizes="(max-w-768px) 100vw, (max-w-1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-text/40">
                    <GraduationCap className="w-16 h-16 text-primary/30 mb-2" />
                    <span className="font-serif text-lg font-bold text-text/50">{member.name}</span>
                    <span className="text-xs mt-1">Image coming soon</span>
                  </div>
                )}
              </div>

              {/* Faculty Metadata */}
              <div className="p-6 flex flex-col flex-grow">
                <Badge variant="secondary" className="w-fit mb-3">
                  {member.subject}
                </Badge>
                
                <h3 className="font-serif text-xl font-bold mb-2">
                  {member.name}
                </h3>
                
                <div className="space-y-2 mt-auto pt-4 border-t border-border/40 text-sm text-text/70">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-primary shrink-0" />
                    <span><strong>Qualification:</strong> {member.qualification}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary shrink-0" />
                    <span><strong>Specialist:</strong> {member.subject} Coaching</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary shrink-0" />
                    <span><strong>Experience:</strong> {member.experience}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

      </div>
    </div>
  );
}

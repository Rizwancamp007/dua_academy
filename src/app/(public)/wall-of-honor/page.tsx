import dbConnect from "@/lib/dbConnect";
import WallOfHonor from "@/models/WallOfHonor";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Award, Trophy, Medal, GraduationCap } from "lucide-react";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function WallOfHonorPage() {
  await dbConnect();
  
  // Fetch active wall of honor items
  const honors = await WallOfHonor.find({ isActive: true }).sort({ order: 1, achievementYear: -1 }).lean();

  return (
    <div className="py-20 bg-bg text-text">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="primary" className="mb-3">Wall of Honor</Badge>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold mb-4">
            Celebrating Academic Excellence
          </h1>
          <p className="text-lg text-text/70">
            Honoring our exceptional students who secured top ranks in board examinations and entry test placements.
          </p>
        </div>

        {/* Honors Grid */}
        {honors.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {honors.map((item: any) => (
              <Card key={item._id.toString()} hoverLift={true} className="flex flex-col h-full !p-0 overflow-hidden relative">
                {/* Visual Trophy Badge Overlay */}
                <div className="absolute top-4 left-4 z-10 bg-secondary text-primary p-2 rounded-full shadow-lg">
                  <Trophy className="w-5 h-5 fill-current text-[#1A1A1A]" />
                </div>

                {/* Student Photo */}
                <div className="relative w-full h-64 bg-primary/5 border-b border-border">
                  {item.imageUrl && !item.imageUrl.includes("placeholder.jpg") ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.studentName}
                      fill
                      className="object-cover"
                      sizes="(max-w-768px) 100vw, (max-w-1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-text/40">
                      <GraduationCap className="w-16 h-16 text-primary/30 mb-2" />
                      <span className="font-serif text-lg font-bold text-text/50">{item.studentName}</span>
                      <span className="text-xs mt-1">Photo coming soon</span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <Badge variant="secondary">
                      Year: {item.achievementYear}
                    </Badge>
                    <span className="text-sm font-semibold text-primary dark:text-secondary flex items-center gap-1">
                      <Medal className="w-4 h-4" />
                      Ranked High
                    </span>
                  </div>

                  <h3 className="font-serif text-xl font-bold mb-2">
                    {item.studentName}
                  </h3>

                  <p className="text-lg font-serif font-semibold text-primary dark:text-secondary mb-3">
                    {item.scoreText}
                  </p>

                  {item.details && (
                    <p className="text-sm text-text/75 leading-relaxed pt-3 border-t border-border/40 mt-auto">
                      {item.details}
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border border-dashed border-border rounded-2xl bg-surface max-w-xl mx-auto">
            <Trophy className="w-16 h-16 text-text/20 mx-auto mb-4" />
            <h3 className="font-serif text-xl font-bold mb-2">Wall of Honor Coming Soon</h3>
            <p className="text-sm text-text/60">
              Profiles of outstanding board exam and entry test rankers are currently being compiled and will be published shortly.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}

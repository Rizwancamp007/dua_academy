import dbConnect from "@/lib/dbConnect";
import Lecture from "@/models/Lecture";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import LecturesClientView from "@/components/LecturesClientView";

export const metadata = {
  title: "Lectures | Duaa Academy",
  description: "Watch free sample and premium video lectures of our expert faculty.",
};

export const dynamic = "force-dynamic";

export default async function LecturesPage() {
  await dbConnect();

  // Load all lectures (trial and premium)
  const lectures = await Lecture.find()
    .populate("classRef", "name")
    .populate("streamRef", "name")
    .populate("subjectRef", "name")
    .sort({ createdAt: -1 })
    .lean();

  // Serialize MongoDB objects for the Client Component
  const lecturesData = lectures.map((l: any) => ({
    _id: l._id.toString(),
    title: l.title,
    isPublicDemo: l.isPublicDemo || false,
    sourceType: l.sourceType,
    url: l.url,
    classRef: l.classRef ? { name: l.classRef.name } : null,
    streamRef: l.streamRef ? { name: l.streamRef.name } : null,
    subjectRef: l.subjectRef ? { name: l.subjectRef.name } : null,
  }));

  return (
    <div className="min-h-screen bg-bg text-text py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <Badge variant="outline" className="text-primary border-primary">Lecture Bank</Badge>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold tracking-tight">
            Academic Lectures
          </h1>
          <p className="text-base text-text/60 leading-relaxed">
            Experience our top-tier teaching methodology. Watch free demo sessions or sign up to unlock our complete lecture library.
          </p>
        </div>

        {/* Client Side Filter & Grid View */}
        <LecturesClientView initialLectures={lecturesData} />

        {/* CTA */}
        <div className="p-8 sm:p-12 bg-primary/5 border border-primary/20 rounded-3xl text-center space-y-6 max-w-4xl mx-auto shadow-xl shadow-primary/5">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold">Unlock Full Academic Access</h2>
          <p className="text-sm text-text/70 leading-relaxed max-w-2xl mx-auto">
            Get instant access to our comprehensive lecture library, subject practice test papers, board exam preparation kits, and cheat prevention mock trials.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto font-bold px-8 py-3 shadow-lg shadow-primary/20 cursor-pointer">
                Register Student Account
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="w-full sm:w-auto font-bold px-8 py-3 cursor-pointer">
                Talk to Counselor
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

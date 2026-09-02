import dbConnect from "@/lib/dbConnect";
import SiteSettings from "@/models/SiteSettings";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { MapPin, Target, Sparkles, ShieldCheck, Quote } from "lucide-react";

export const revalidate = 60; // Revalidate every 60 seconds

async function getSiteSettings() {
  try {
    await dbConnect();
    const settings = await SiteSettings.findOne().lean();
    return (
      settings || {
        directorName: "Sir Rizwan Khan",
        directorTitle: "Founder & Managing Director",
        directorMessage:
          "Welcome to Duaa Academy. For over two decades, our mission has been to deliver conceptual clarity, structured test pacing, and academic confidence to matric, intermediate, and competitive test candidates in Mirpur Mathelo.",
        directorImage: "/brand/placeholder.jpg",
      }
    );
  } catch (error) {
    return {
      directorName: "Sir Rizwan Khan",
      directorTitle: "Founder & Managing Director",
      directorMessage:
        "Welcome to Duaa Academy. For over two decades, our mission has been to deliver conceptual clarity, structured test pacing, and academic confidence to matric, intermediate, and competitive test candidates in Mirpur Mathelo.",
      directorImage: "/brand/placeholder.jpg",
    };
  }
}

export default async function AboutPage() {
  const settings = await getSiteSettings();

  const values = [
    {
      title: "Clarity Over Rote-Learning",
      desc: "Our teaching model focuses on conceptual learning rather than blind memorization, ensuring long-term memory mapping for university test entrances.",
      icon: Sparkles,
    },
    {
      title: "Parental Integration",
      desc: "We believe education is a tripartite contract. Parents are actively updated on results, attendance, and student tracking via WhatsApp structures.",
      icon: ShieldCheck,
    },
    {
      title: "Continuous Assessment",
      desc: "Our students are tested weekly. We hold regular, mock examinations simulating board layouts to strip away exam fear and construct paper pacing skills.",
      icon: Target,
    },
  ];

  return (
    <div className="py-16 sm:py-20 bg-bg text-text">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="primary" className="mb-3">Our History</Badge>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold leading-tight mb-4">
            20 Years of Educational Excellence
          </h1>
          <p className="text-lg text-text/70">
            For two decades, Duaa Academy has stood as the premier coaching center in Mirpur Mathelo, committed to unlocking every student's full potential.
          </p>
        </div>

        {/* Director's Message Section */}
        {settings?.directorMessage && (
          <div className="mb-20">
            <Card hoverLift={false} className="p-8 sm:p-10 border border-primary/20 bg-surface relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center relative z-10">
                {/* Director Photo */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-2xl overflow-hidden border-2 border-primary/30 shadow-md bg-bg mb-4">
                    <img
                      src={settings.directorImage || "/brand/placeholder.jpg"}
                      alt={settings.directorName || "Director"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-text">
                    {settings.directorName || "Sir Rizwan Khan"}
                  </h3>
                  <p className="text-xs font-medium text-primary uppercase tracking-wider mt-1">
                    {settings.directorTitle || "Founder & Managing Director"}
                  </p>
                </div>

                {/* Director Statement Quote */}
                <div className="md:col-span-2 space-y-4">
                  <div className="flex items-center gap-2 text-primary">
                    <Quote className="w-8 h-8 opacity-40 rotate-180" />
                    <span className="font-serif text-lg font-bold">Director's Message</span>
                  </div>
                  <p className="text-base sm:text-lg text-text/80 leading-relaxed italic font-serif">
                    "{settings.directorMessage}"
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Narrative Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-4">
              Our Story & Commitment
            </h2>
            <p className="text-text/70 mb-4 leading-relaxed">
              Founded in Mirpur Mathelo, Duaa Academy was established with a singular vision: to bring high-quality, concept-driven coaching classes to matric and intermediate board students. 
            </p>
            <p className="text-text/70 leading-relaxed">
              Operating out of our central venue at **Ikhlas Model High School**, our academy has expanded from a local coaching setup to a modern, dynamic educational institute. Through our advanced testing engines, expert faculty, and structured digital workflows, we keep pushing the envelope on student achievements.
            </p>
          </div>
          
          <div className="relative border border-border rounded-xl p-8 bg-surface shadow-lg overflow-hidden flex flex-col space-y-6">
            <div className="absolute top-0 right-0 p-16 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10 text-primary">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold">Physical Campus</h3>
                <p className="text-sm text-text/60">Convenient, secure classroom facilities</p>
              </div>
            </div>
            
            <p className="text-sm text-text/70 font-semibold pl-14">
              Ikhlas Model High School, Mirpur Mathelo
            </p>
            
            <p className="text-sm text-text/70 pl-14 leading-relaxed">
              Our campus hosts comfortable learning halls, active testing corridors, and career counseling helpdesks designed to foster distraction-free learning.
            </p>
          </div>
        </div>

        {/* Core Values Section */}
        <div className="border-t border-border/50 pt-20">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="secondary" className="mb-3">Core Pillars</Badge>
            <h2 className="font-serif text-3xl font-bold">What Powers Duaa Academy</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <Card key={i} hoverLift={true} className="flex flex-col">
                  <div className="p-3 rounded-lg bg-primary/10 text-primary w-fit mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-xl font-bold mb-3">{v.title}</h3>
                  <p className="text-sm text-text/70 leading-relaxed flex-grow">
                    {v.desc}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

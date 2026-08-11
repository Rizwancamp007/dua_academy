import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { MapPin, Target, Sparkles, ShieldCheck } from "lucide-react";

export default function AboutPage() {
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
    <div className="py-20 bg-bg text-text">
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

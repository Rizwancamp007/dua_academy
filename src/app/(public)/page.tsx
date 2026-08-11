import dbConnect from "@/lib/dbConnect";
import SiteSettings from "@/models/SiteSettings";
import HeroSlide from "@/models/HeroSlide";
import Hero from "@/components/Hero";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Award, BookOpen, Users, CheckCircle, GraduationCap, ArrowRight, Video, MessageSquare } from "lucide-react";
import Link from "next/link";

const defaultSlides = [
  {
    title: "Shape Your Academic Destiny",
    subtitle: "Comprehensive Coaching classes for Matric, Intermediate, MDCAT & ECAT prep.",
    imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1200",
    buttonText: "Explore Courses",
    buttonLink: "#programs",
  },
  {
    title: "Learn From the Master Faculty",
    subtitle: "Highly qualified subject specialists dedicated to your success and concept building.",
    imageUrl: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1200",
    buttonText: "Our Faculty",
    buttonLink: "/faculty",
  },
  {
    title: "Proven Preparation Methods",
    subtitle: "Weekly tests, interactive WhatsApp tracking, and individualized guidance.",
    imageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1200",
    buttonText: "Register Online",
    buttonLink: "/register",
  },
];

export const dynamic = "force-dynamic";

export default async function PublicHomePage() {
  await dbConnect();
  
  const settingsDoc = await SiteSettings.findOne().lean();
  const dbSlides = await HeroSlide.find({ isActive: true }).sort({ order: 1 }).lean();

  const settings = {
    commenceDate: (settingsDoc?.commenceDate as string) || "September 1, 2026",
    classTimings: (settingsDoc?.classTimings as string) || "03:00 PM - 07:00 PM",
    admissionsOpen: settingsDoc?.admissionsOpen !== false,
  };

  const slides = dbSlides.length > 0
    ? dbSlides.map((s: any) => ({
        title: s.title,
        subtitle: s.subtitle,
        imageUrl: s.imageUrl,
        buttonText: s.buttonText || "Learn More",
        buttonLink: s.buttonLink || "#",
      }))
    : defaultSlides;

  const stats = [
    { label: "Years of Excellence", value: "20+", icon: Award },
    { label: "Expert Instructors", value: "6+", icon: Users },
    { label: "Standard Classes", value: "IX - XII", icon: BookOpen },
    { label: "MDCAT & ECAT Courses", value: "Yes", icon: GraduationCap },
  ];

  const differentiators = [
    {
      title: "Expert Faculty",
      desc: "Learn from highly experienced, subject specialists who are masters in matric and intermediate boards.",
      icon: Users,
    },
    {
      title: "Parent-Faculty WhatsApp Group",
      desc: "Interactive groups to keep parents updated about student attendance, testing results, and progress updates.",
      icon: MessageSquare,
    },
    {
      title: "Regular Testing System",
      desc: "Weekly chapter tests, monthly assessments, and mock examinations mimicking board paper patterns.",
      icon: CheckCircle,
    },
    {
      title: "Proven Track Record",
      desc: "Thousands of students guided to premium grades and high-ranking engineering and medical universities.",
      icon: Award,
    },
    {
      title: "Individual Student Guidance",
      desc: "Personal mentoring for weak concepts and medical/engineering career choice counselling sessions.",
      icon: GraduationCap,
    },
  ];

  return (
    <div className="w-full flex flex-col">
      {/* Hero Section */}
      <Hero slides={slides} settings={settings} />

      {/* Stats Strip */}
      <section className="bg-surface border-b border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="flex flex-col items-center p-4">
                  <div className="p-3 rounded-full bg-primary/10 text-primary mb-3">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-3xl font-serif font-bold text-text mb-1">{stat.value}</span>
                  <span className="text-sm text-text/60 font-medium">{stat.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Admissions Mobile Callout Banner */}
      {settings.admissionsOpen && (
        <section className="md:hidden bg-primary text-white py-4 px-6 text-center border-b border-secondary/20">
          <Badge variant="secondary" className="mb-2 uppercase">Admissions Open</Badge>
          <p className="text-sm font-semibold text-secondary">Classes commence on {settings.commenceDate}</p>
          <p className="text-xs text-white/80 mt-1">Timings: {settings.classTimings}</p>
          <Link href="/register" className="inline-block mt-3">
            <Button size="sm" variant="secondary">Register Now</Button>
          </Link>
        </section>
      )}

      {/* Academic Programs Section */}
      <section id="programs" className="py-20 bg-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="primary" className="mb-3">Academic Programs</Badge>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-text mb-4">
              Curated Courses for Board & Entry Tests
            </h2>
            <p className="text-text/70">
              We offer comprehensive exam-focused classroom preparation tailored for Sindh Board curriculums alongside rigorous test prep for engineering and medical college entrance tests.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Matric Board card */}
            <Card hoverLift={true}>
              <div className="p-2 rounded-lg bg-primary/10 text-primary w-fit mb-6">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-2xl font-bold mb-3">Matriculation (IX & X)</h3>
              <p className="text-text/70 mb-6 min-h-[80px]">
                Complete conceptual training for 9th and 10th grade Sindh Board examinations in Biology, Chemistry, Physics, Mathematics, and English.
              </p>
              <ul className="space-y-2 mb-8 text-sm text-text/80">
                <li className="flex items-center gap-2">✓ Exhaustive Syllabus Coverage</li>
                <li className="flex items-center gap-2">✓ Board Paper Solving Practise</li>
                <li className="flex items-center gap-2">✓ Free Chapter-wise Testing Notes</li>
              </ul>
              <Link href="/register">
                <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                  Apply Online <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </Card>

            {/* Intermediate Board card */}
            <Card hoverLift={true}>
              <div className="p-2 rounded-lg bg-primary/10 text-primary w-fit mb-6">
                <GraduationCap className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-2xl font-bold mb-3">Intermediate (XI & XII)</h3>
              <p className="text-text/70 mb-6 min-h-[80px]">
                Specialized instruction for F.Sc Pre-Medical and Pre-Engineering students, laying solid foundations for Board papers.
              </p>
              <ul className="space-y-2 mb-8 text-sm text-text/80">
                <li className="flex items-center gap-2">✓ Advanced Numerical Problem Solving</li>
                <li className="flex items-center gap-2">✓ Concept-driven Physics & Chemistry labs</li>
                <li className="flex items-center gap-2">✓ Specialized Maths & Biology desks</li>
              </ul>
              <Link href="/register">
                <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                  Apply Online <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </Card>

            {/* Entry Test Prep card */}
            <Card hoverLift={true}>
              <div className="p-2 rounded-lg bg-secondary/15 text-primary w-fit mb-6">
                <Award className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="font-serif text-2xl font-bold mb-3 text-primary dark:text-secondary">MDCAT & ECAT Prep</h3>
              <p className="text-text/70 mb-6 min-h-[80px]">
                Intensive preparation for medical (MDCAT) and engineering (ECAT) entrance examinations, with shortcut tips and logical reasoning desks.
              </p>
              <ul className="space-y-2 mb-8 text-sm text-text/80">
                <li className="flex items-center gap-2">✓ 10,000+ Practice MCQ Banks</li>
                <li className="flex items-center gap-2">✓ Speed-running timed mock tests</li>
                <li className="flex items-center gap-2">✓ Detailed explanations for every question</li>
              </ul>
              <Link href="/register">
                <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                  Apply Online <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* Differentiators Section */}
      <section className="py-20 bg-surface border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="secondary" className="mb-3">Why Choose Us</Badge>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-text mb-4">
              Commitment to Student Success
            </h2>
            <p className="text-text/70">
              At Duaa Academy, we go beyond standard curriculum teaching to build structural trackers that ensure student comprehension and parent inclusion.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {differentiators.map((diff, index) => {
              const Icon = diff.icon;
              return (
                <div key={index} className="flex gap-4 p-4 rounded-xl border border-border bg-bg hover:border-primary/20 transition-all duration-300">
                  <div className="p-3 rounded-lg bg-primary/10 text-primary shrink-0 h-fit">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold mb-2">{diff.title}</h3>
                    <p className="text-sm text-text/70 leading-relaxed">{diff.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Video & Media Showcase Section */}
      <section className="py-20 bg-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Embed Video Panel */}
            <div className="relative aspect-video w-full rounded-xl overflow-hidden shadow-2xl border border-border">
              {/* Responsive Iframe Embed for YouTube Playlist/Channel promo */}
              <iframe
                className="absolute inset-0 w-full h-full"
                src="https://www.youtube.com/embed/videoseries?list=PL_Xq981O8yWJ3c4R85x8nQ0u26L-B52Vd"
                title="Duaa Academy YouTube Lecture Showcase"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>

            {/* Video Copy Details */}
            <div className="flex flex-col space-y-6">
              <Badge variant="primary" className="w-fit">Video Lectures</Badge>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-text leading-tight">
                Preview Our Teaching Methods Online
              </h2>
              <p className="text-text/70 leading-relaxed">
                We maintain an active digital library to support student revisions. Check out demo lectures, mock paper breakdowns, and exam tips delivered by our senior faculty directly on our official YouTube channel.
              </p>
              
              <div className="flex flex-wrap gap-4 pt-2">
                <a
                  href="https://youtube.com/@duaacademymirpurmathelo9633"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="flex items-center gap-2">
                    <Video className="w-4 h-4" /> Watch more on YouTube
                  </Button>
                </a>
                <Link href="/login">
                  <Button variant="outline">Access Full Student Portal</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

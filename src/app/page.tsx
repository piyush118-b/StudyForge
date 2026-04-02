import Link from "next/link";
import {
  ArrowRight, Zap, ShieldCheck, GraduationCap, BookOpen,
  Brain, CheckSquare, Timer, BarChart3, Camera, Bell,
  Sparkles, ChevronRight, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Brain,
    title: "AI Timetable Generator",
    description: "Answer a few questions about your schedule, subjects, and energy patterns. Gemini builds you a clash-free, optimized weekly plan in 60 seconds.",
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    icon: CheckSquare,
    title: "Smart Task Board",
    description: "A full Kanban board with drag-and-drop, priority labels, due dates, and filters. Track every assignment, exam, and study goal.",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: Timer,
    title: "Pomodoro Focus Mode",
    description: "Built-in 25-minute focus timer with immersive full-screen mode, ambient sounds, and session stats to keep you in the zone.",
    gradient: "from-orange-500 to-amber-500",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "GitHub-style contribution heatmap, daily streaks, subject breakdown charts, and weekly progress reports to keep you accountable.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Camera,
    title: "Photo → Tasks (OCR)",
    description: "Snap a photo of your whiteboard or syllabus. Gemini Vision reads the handwriting and converts it into structured, actionable tasks.",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description: "Get nudged before deadlines hit. Smart reminders adapt to your schedule and notify you at the right moment.",
    gradient: "from-violet-500 to-fuchsia-500",
  },
];

const steps = [
  { step: "01", title: "Create Your Profile", description: "Tell us your college, semester, and branch. Takes 30 seconds." },
  { step: "02", title: "Set Up Your Schedule", description: "Add subjects, commitments, and preferences — or let AI do it for you." },
  { step: "03", title: "Start Studying Smarter", description: "Get your optimized timetable, track tasks, and crush your semester." },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">

      {/* ─── NAVBAR ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">StudyForge <span className="text-indigo-400">AI</span></span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-white/5 hidden sm:inline-flex">
                Log In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 px-5">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 px-6">
        {/* Background blurs */}
        <div className="absolute top-[10%] left-[-5%] w-[500px] h-[500px] bg-indigo-500/15 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[0%] right-[-5%] w-[400px] h-[400px] bg-teal-500/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-teal-300 backdrop-blur-sm shadow-xl shadow-teal-900/10 mb-8">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Powered by Gemini 2.5 Flash</span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.05]">
            <span className="bg-clip-text text-transparent bg-gradient-to-br from-white via-white/90 to-white/50">
              Your semester,
            </span>
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-teal-400 to-emerald-400">
              perfectly planned.
            </span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            The AI-powered study suite that builds your timetable, tracks your tasks,
            and keeps you focused — so you can stop planning and start achieving.
          </p>

          {/* CTA */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/signup">
              <Button size="lg" className="h-14 px-10 rounded-2xl text-lg font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-2xl shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95 group">
                Start Free — No Card Required
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="ghost" size="lg" className="h-14 px-8 rounded-2xl text-lg text-slate-400 hover:text-white hover:bg-white/5 group">
                Explore as Guest
                <ChevronRight className="ml-1 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          {/* Trust */}
          <div className="mt-16 flex flex-col items-center gap-3">
            <div className="flex items-center">
              {[1,2,3,4,5].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-950 bg-gradient-to-br from-indigo-400 to-teal-400 ml-[-10px] first:ml-0 flex items-center justify-center text-xs font-bold shadow-sm">
                  S{i}
                </div>
              ))}
              <span className="ml-4 text-sm font-medium text-slate-400">
                Loved by <span className="text-white font-semibold">10,000+</span> students
              </span>
            </div>
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
              <span className="text-sm text-slate-500 ml-1">4.9/5 rating</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="py-20 md:py-32 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-indigo-400 uppercase tracking-widest mb-3">Everything You Need</p>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              One app to rule your semester
            </h2>
            <p className="mt-4 text-slate-400 max-w-xl mx-auto">
              From AI-generated timetables to photo-based task import — everything a college student needs, in one place.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6 hover:border-slate-700 transition-all hover:bg-slate-900/80 hover:-translate-y-1"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-20 md:py-32 px-6 bg-slate-900/30 border-y border-slate-800/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-teal-400 uppercase tracking-widest mb-3">Simple as 1-2-3</p>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              Get started in minutes
            </h2>
          </div>

          <div className="space-y-8">
            {steps.map((s, idx) => (
              <div key={s.step} className="flex items-start gap-6 group">
                <div className="shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-teal-500/20 border border-indigo-500/20 flex items-center justify-center text-xl font-extrabold text-indigo-400 group-hover:scale-110 transition-transform">
                  {s.step}
                </div>
                <div className="pt-1">
                  <h3 className="text-xl font-bold text-white mb-1">{s.title}</h3>
                  <p className="text-slate-400">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="py-24 md:py-36 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/5 to-transparent pointer-events-none" />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6">
            Ready to ace this semester?
          </h2>
          <p className="text-lg text-slate-400 mb-10 max-w-lg mx-auto">
            Join thousands of students who stopped stressing about schedules and started achieving their goals.
          </p>
          <Link href="/auth/signup">
            <Button size="lg" className="h-16 px-12 rounded-2xl text-lg font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-2xl shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95 group">
              Start Your Journey
              <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-slate-800/50 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-bold">StudyForge <span className="text-indigo-400">AI</span></span>
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <Link href="/auth/login" className="hover:text-white transition-colors">Login</Link>
            <Link href="/auth/signup" className="hover:text-white transition-colors">Sign Up</Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
          </div>
          <p className="text-xs text-slate-600">
            © 2026 StudyForge AI. Built for students, by students.
          </p>
        </div>
      </footer>
    </div>
  );
}

import Link from "next/link";
import {
  ArrowRight, Brain, CheckSquare, Timer,
  BarChart3, Camera, Bell, BookOpen, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

const features = [
  {
    icon: Brain,
    tag: "AI",
    title: "AI Timetable Generator",
    description: "Answer a few questions about your schedule, subjects, and energy patterns. Gemini builds you a clash-free, optimized weekly plan in 60 seconds.",
    gradient: "from-indigo-500 to-violet-600",
  },
  {
    icon: CheckSquare,
    tag: "Productivity",
    title: "Smart Task Board",
    description: "A full Kanban board with drag-and-drop, priority labels, due dates, and filters. Track every assignment, exam, and study goal.",
    gradient: "from-orange-500 to-amber-600",
  },
  {
    icon: Timer,
    tag: "Focus",
    title: "Pomodoro Focus Mode",
    description: "Built-in 25-minute focus timer with immersive full-screen mode, ambient sounds, and session stats to keep you in the zone.",
    gradient: "from-red-500 to-rose-600",
  },
  {
    icon: BarChart3,
    tag: "Analytics",
    title: "Analytics Dashboard",
    description: "GitHub-style contribution heatmap, daily streaks, subject breakdown charts, and weekly progress reports to keep you accountable.",
    gradient: "from-blue-500 to-cyan-600",
  },
  {
    icon: Camera,
    tag: "OCR",
    title: "Photo → Tasks",
    description: "Snap a photo of your whiteboard or syllabus. Gemini Vision reads the handwriting and converts it into structured, actionable tasks.",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    icon: Bell,
    tag: "Reminders",
    title: "Smart Notifications",
    description: "Get nudged before deadlines hit. Smart reminders adapt to your schedule and notify you at the right moment.",
    gradient: "from-purple-500 to-fuchsia-600",
  },
];

const steps = [
  { step: "01", title: "Create Your Profile", description: "Tell us your college, semester, and branch. Takes 30 seconds." },
  { step: "02", title: "Set Up Your Schedule", description: "Add subjects, commitments, and preferences — or let AI do it for you." },
  { step: "03", title: "Start Studying Smarter", description: "Get your optimized timetable, track tasks, and crush your semester." },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F0F0F0] overflow-x-hidden">

      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-[#2A2A2A]/60 bg-[#0A0A0A]/85 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto h-full px-6 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.4)]">
              <BookOpen className="w-4 h-4 text-[#F0F0F0]" />
            </div>
            <span className="font-bold text-[#F0F0F0] tracking-tight text-sm">
              StudyForge
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-[rgba(16,185,129,0.12)] text-[#10B981] border border-[#10B981]/25">
              AI
            </span>
          </Link>

          {/* CTAs */}
          <div className="flex items-center gap-2">
            <Link href="/auth/login" className="hidden sm:block">
              <Button variant="ghost" size="sm" className="text-[#A0A0A0] hover:text-[#F0F0F0] hover:bg-[#222222]">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm" className="bg-[#10B981] hover:bg-[#34D399] text-[#0A0A0A] font-bold shadow-[0_0_0_1px_rgba(16,185,129,0.3),0_0_20px_rgba(16,185,129,0.15)] hover:shadow-[0_0_0_1px_rgba(16,185,129,0.5),0_0_30px_rgba(16,185,129,0.25)] transition-all duration-150-all px-5">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16 overflow-hidden">

        {/* Emerald glow blob */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-[#10B981]/6 blur-[140px] rounded-full pointer-events-none select-none" />

        {/* Dot grid */}
        <div className="absolute inset-0 bg-[radial-gradient(circle,#2A2A2A_1px,transparent_1px)] bg-[size:32px_32px] opacity-35 pointer-events-none select-none" />

        {/* Gradient fade over grid */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A] via-transparent to-[#0A0A0A] pointer-events-none select-none" />

        {/* Hero content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto">

          {/* Announcement badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] text-xs font-medium text-[#A0A0A0] mb-8 shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] shadow-[0_0_6px_rgba(16,185,129,0.8)] animate-pulse" />
            Built with Gemini 2.5 Flash · Free to start · 200+ colleges
          </div>

          {/* Main headline */}
          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.02] text-[#F0F0F0] mb-6">
            Your semester,
            <br />
            <span className="bg-gradient-to-r from-[#10B981] via-[#34D399] to-[#14B8A6] bg-clip-text text-transparent">
              perfectly planned.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-[#A0A0A0] max-w-2xl mx-auto leading-relaxed mb-10">
            The AI-powered study suite that builds your timetable, tracks your tasks,
            and keeps you focused — so you can stop planning and start achieving.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
            <Link href="/auth/signup">
              <Button size="xl" className="w-full sm:w-auto h-14 px-10 text-lg font-bold bg-[#10B981] hover:bg-[#34D399] text-[#0A0A0A] shadow-[0_0_0_1px_rgba(16,185,129,0.3),0_0_20px_rgba(16,185,129,0.15)] hover:shadow-[0_0_0_1px_rgba(16,185,129,0.5),0_0_40px_rgba(16,185,129,0.25)] transition-all duration-150-all group">
                Start Free
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-all duration-150-transform" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="secondary" size="xl" className="w-full sm:w-auto h-14 px-8 text-lg font-semibold bg-[#1A1A1A] border border-[#2A2A2A] text-[#A0A0A0] hover:bg-[#222222] hover:text-[#F0F0F0] hover:border-[#333333] group">
                Explore as Guest
                <ChevronRight className="ml-1 w-5 h-5 group-hover:translate-x-1 transition-all duration-150-transform" />
              </Button>
            </Link>
          </div>

          {/* Social proof */}
          <p className="text-sm text-[#606060]">
            Used by students at IITs, NITs, IIITs &amp; 200+ colleges across India
          </p>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <ScrollReveal>
        <div className="border-y border-[#2A2A2A] bg-[#111111]/60 py-8">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 px-6">
            {[
              { value: "200+", label: "Colleges Supported" },
              { value: "50K+", label: "Blocks Tracked" },
              { value: "150+", label: "Branches & Streams" },
              { value: "Free", label: "To Get Started" },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-2xl font-black text-[#F0F0F0] mb-1">{value}</p>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#606060]">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24 px-6 relative bg-[#111111]/30">

        <ScrollReveal>
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#606060] mb-3">
              Why StudyForge
            </p>
            <h2 className="text-3xl md:text-4xl font-black text-[#F0F0F0] tracking-tight mb-4">
              Everything you need to{" "}
              <span className="text-[#10B981]">actually study</span>
            </h2>
            <p className="text-[#A0A0A0] leading-relaxed">
              One platform to replace your planner, calendar, task list, and timer.
              Built for how Indian students actually study.
            </p>
          </div>
        </ScrollReveal>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(({ icon: Icon, tag, gradient, title, description }, i) => (
            <ScrollReveal key={title} delay={i * 0.07}>
              <div
                className="group bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6 cursor-default transition-all duration-150-all duration-200 hover:-translate-y-0.5 hover:border-[#333333] hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 shadow-[0_2px_8px_rgba(0,0,0,0.3)]`}>
                  <Icon className="w-5 h-5 text-[#F0F0F0]" />
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-[#222222] border border-[#2A2A2A] text-[#606060] mb-3">
                  {tag}
                </span>
                <h3 className="text-base font-semibold text-[#F0F0F0] tracking-tight mb-2 group-hover:text-[#10B981] transition-all duration-150-colors">
                  {title}
                </h3>
                <p className="text-sm text-[#A0A0A0] leading-relaxed">{description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 md:py-32 px-6 border-t border-[#2A2A2A]/50 bg-[#1A1A1A]/20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#606060] mb-3">Simple as 1-2-3</p>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-[#F0F0F0]">
              Get started in minutes
            </h2>
          </div>

          <div className="space-y-10 pl-4 md:pl-0">
            {steps.map((s) => (
              <div key={s.step} className="flex items-start gap-6 md:gap-8 group">
                <div className="shrink-0 w-16 h-16 rounded-2xl bg-[#10B981]/10 border border-[#10B981]/30 flex items-center justify-center text-xl font-black text-[#10B981] shadow-[0_0_15px_rgba(16,185,129,0.15)] group-hover:bg-[#10B981] group-hover:text-[#0A0A0A] transition-all duration-150-all duration-300">
                  {s.step}
                </div>
                <div className="pt-2">
                  <h3 className="text-2xl font-bold text-[#F0F0F0] mb-2 group-hover:text-[#10B981] transition-all duration-150-colors">{s.title}</h3>
                  <p className="text-lg text-[#A0A0A0] leading-relaxed">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="relative py-24 px-6 overflow-hidden border-t border-[#2A2A2A]/50">
        <ScrollReveal direction="up" className="relative z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#10B981]/8 blur-[100px] rounded-full pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-black text-[#F0F0F0] tracking-tight mb-4">
              Ready to own your semester?
            </h2>
            <p className="text-[#A0A0A0] mb-8 leading-relaxed">
              Join thousands of Indian students who&apos;ve replaced 5 scattered apps
              with one AI-powered Academic OS.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/auth/signup">
                <Button size="xl" className="h-14 px-10 text-lg font-bold bg-[#10B981] hover:bg-[#34D399] text-[#0A0A0A] shadow-[0_0_0_1px_rgba(16,185,129,0.3),0_0_20px_rgba(16,185,129,0.15)] hover:shadow-[0_0_0_1px_rgba(16,185,129,0.5),0_0_40px_rgba(16,185,129,0.25)] transition-all duration-150-all group active:scale-[0.97]">
                Start Your Journey
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-all duration-150-transform" />
              </Button>
            </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-[#2A2A2A] bg-[#111111] py-12 px-6">
        <div className="max-w-5xl mx-auto">

          {/* Top row */}
          <div className="flex flex-col md:flex-row justify-between gap-10 mb-10">
            <div className="max-w-xs">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#10B981] to-[#059669]" />
                <span className="font-bold text-[#F0F0F0] text-sm tracking-tight">StudyForge AI</span>
              </div>
              <p className="text-sm text-[#606060] leading-relaxed">
                The Academic OS for Indian college students.
                Built with ❤️ by students, for students.
              </p>
            </div>

            <div className="flex gap-16">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#3A3A3A] mb-3">Product</p>
                <div className="space-y-2">
                  <Link href="/dashboard" className="block text-sm text-[#606060] hover:text-[#A0A0A0] transition-all duration-150-colors duration-150">Dashboard</Link>
                  <Link href="/pricing" className="block text-sm text-[#606060] hover:text-[#A0A0A0] transition-all duration-150-colors duration-150">Pricing</Link>
                  <Link href="/auth/signup" className="block text-sm text-[#606060] hover:text-[#A0A0A0] transition-all duration-150-colors duration-150">Sign Up</Link>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#3A3A3A] mb-3">Account</p>
                <div className="space-y-2">
                  <Link href="/auth/login" className="block text-sm text-[#606060] hover:text-[#A0A0A0] transition-all duration-150-colors duration-150">Login</Link>
                  <Link href="/auth/signup" className="block text-sm text-[#606060] hover:text-[#A0A0A0] transition-all duration-150-colors duration-150">Create Account</Link>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom row */}
          <div className="border-t border-[#2A2A2A] pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-xs text-[#606060]">© 2026 StudyForge AI. Made in India 🇮🇳</p>
            <div className="flex items-center gap-6">
              <Link href="/auth/login" className="text-xs text-[#606060] hover:text-[#A0A0A0] transition-all duration-150-colors">Login</Link>
              <Link href="/auth/signup" className="text-xs text-[#606060] hover:text-[#A0A0A0] transition-all duration-150-colors">Sign Up</Link>
              <Link href="/dashboard" className="text-xs text-[#606060] hover:text-[#A0A0A0] transition-all duration-150-colors">Dashboard</Link>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}

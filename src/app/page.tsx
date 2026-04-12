import Link from "next/link";
import {
  ArrowRight, Brain, CheckSquare, Timer,
  BarChart3, Camera, Bell, BookOpen, ChevronRight,
  Heart, Sparkles, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

const features = [
  {
    icon: Brain,
    tag: "AI",
    title: "A timetable that gets you.",
    description: "Tell it your subjects, your energy patterns, even your bad days. It builds a realistic, clash-free weekly plan — not a fantasy schedule you'll abandon by Wednesday.",
    gradient: "from-indigo-500 to-violet-600",
    feel: "No more Sunday night panic."
  },
  {
    icon: CheckSquare,
    tag: "Tasks",
    title: "Your chaos, finally organized.",
    description: "Assignments, exams, side projects — all in one Kanban board. Drag, prioritize, and actually know what needs your attention today.",
    gradient: "from-orange-500 to-amber-600",
    feel: "Like a clear head, but in an app."
  },
  {
    icon: Timer,
    tag: "Focus",
    title: "Deep work, without the guilt.",
    description: "Full-screen focus mode with ambient sounds and a session timer. No notifications, no distractions. Just you and your goals.",
    gradient: "from-red-500 to-rose-600",
    feel: "You'll actually look forward to studying."
  },
  {
    icon: BarChart3,
    tag: "Analytics",
    title: "See yourself actually improving.",
    description: "A GitHub-style heatmap shows your consistency. Weekly charts show what subjects need love. Streaks show how far you've come.",
    gradient: "from-blue-500 to-cyan-600",
    feel: "Progress you can feel proud of."
  },
  {
    icon: Camera,
    tag: "OCR",
    title: "Snap a syllabus. Get a plan.",
    description: "Point your camera at any whiteboard, printout, or handwritten note. Gemini Vision reads it and turns it into structured tasks instantly.",
    gradient: "from-emerald-500 to-teal-600",
    feel: "From messy to managed in seconds."
  },
  {
    icon: Bell,
    tag: "Nudges",
    title: "The gentle push you actually need.",
    description: "Smart reminders that know your schedule. Not spammy notifications — thoughtful nudges before deadlines actually hit.",
    gradient: "from-purple-500 to-fuchsia-600",
    feel: "Like a friend who won't let you forget."
  },
];

const steps = [
  {
    step: "01",
    title: "Tell us about yourself.",
    description: "College, semester, subjects — it takes 30 seconds. The more you share, the smarter it gets.",
    note: "No judgment. We've all been behind on stuff."
  },
  {
    step: "02",
    title: "Let AI build your week.",
    description: "Or do it yourself with our drag-and-drop editor. Either way, you get a plan that actually fits your life.",
    note: "It adapts. Life happens, and that's okay."
  },
  {
    step: "03",
    title: "Show up. Track. Grow.",
    description: "Mark blocks done, log how it went, watch your analytics tell a story of real progress.",
    note: "Small wins every day. That's the game."
  },
];

const whyDifferent = [
  {
    icon: Heart,
    title: "It doesn't judge you.",
    description: "Missed a study block? That's fine. StudyForge just adjusts and moves forward with you — no shame, no guilt trips.",
  },
  {
    icon: Sparkles,
    title: "It speaks your language.",
    description: "Built for Indian students, by people who know what semester pressure, backlog panic, and internship anxiety actually feel like.",
  },
  {
    icon: Zap,
    title: "It replaces 5 apps at once.",
    description: "Calendar. Task manager. Pomodoro timer. Analytics. Notes. All inside one clean workspace that actually talks to itself.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F0F0F0] overflow-x-hidden">

      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-[#2A2A2A]/60 bg-[#0A0A0A]/85 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto h-full px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.4)]">
              <BookOpen className="w-4 h-4 text-[#F0F0F0]" />
            </div>
            <span className="font-bold text-[#F0F0F0] tracking-tight text-sm">StudyForge</span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-[rgba(16,185,129,0.12)] text-[#10B981] border border-[#10B981]/25">
              AI
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/auth/login" className="hidden sm:block">
              <Button variant="ghost" size="sm" className="text-[#A0A0A0] hover:text-[#F0F0F0] hover:bg-[#222222]">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm" className="bg-[#10B981] hover:bg-[#34D399] text-[#0A0A0A] font-bold shadow-[0_0_0_1px_rgba(16,185,129,0.3),0_0_20px_rgba(16,185,129,0.15)] hover:shadow-[0_0_0_1px_rgba(16,185,129,0.5),0_0_30px_rgba(16,185,129,0.25)] transition-all duration-150 px-5">
                Start Free →
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16 overflow-hidden">

        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-[#10B981]/6 blur-[140px] rounded-full pointer-events-none select-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle,#2A2A2A_1px,transparent_1px)] bg-[size:32px_32px] opacity-35 pointer-events-none select-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A] via-transparent to-[#0A0A0A] pointer-events-none select-none" />

        <div className="relative z-10 text-center max-w-4xl mx-auto">

          {/* Announcement badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] text-xs font-medium text-[#A0A0A0] mb-8 shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] shadow-[0_0_6px_rgba(16,185,129,0.8)] animate-pulse" />
            Powered by Gemini 2.5 Flash · Free to start · 200+ colleges
          </div>

          {/* Main headline */}
          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.02] text-[#F0F0F0] mb-6">
            Finally, a study plan
            <br />
            <span className="bg-gradient-to-r from-[#10B981] via-[#34D399] to-[#14B8A6] bg-clip-text text-transparent">
              that sticks with you.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-[#A0A0A0] max-w-2xl mx-auto leading-relaxed mb-4">
            You don&apos;t need more willpower. You need a system that actually understands
            your schedule, your subjects, and your very human tendency to procrastinate.
          </p>
          <p className="text-sm text-[#606060] mb-10 italic">
            It&apos;s like having a friend who knows exactly what you should do next.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
            <Link href="/auth/signup">
              <Button size="xl" className="w-full sm:w-auto h-14 px-10 text-lg font-bold bg-[#10B981] hover:bg-[#34D399] text-[#0A0A0A] shadow-[0_0_0_1px_rgba(16,185,129,0.3),0_0_20px_rgba(16,185,129,0.15)] hover:shadow-[0_0_0_1px_rgba(16,185,129,0.5),0_0_40px_rgba(16,185,129,0.25)] transition-all duration-150 group">
                Start My Smart Journey
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="secondary" size="xl" className="w-full sm:w-auto h-14 px-8 text-lg font-semibold bg-[#1A1A1A] border border-[#2A2A2A] text-[#A0A0A0] hover:bg-[#222222] hover:text-[#F0F0F0] hover:border-[#333333] group">
                Explore as Guest
                <ChevronRight className="ml-1 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          {/* Social proof */}
          <p className="text-sm text-[#606060]">
            Trusted by students at IITs, NITs, IIITs & 200+ colleges across India 🇮🇳
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

      {/* ── BEFORE / AFTER BRIDGE ── */}
      <ScrollReveal>
        <section className="py-20 px-6 bg-[#111111]/40">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#606060] mb-4">Sound familiar?</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
              <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6 text-left">
                <p className="text-xs font-semibold uppercase tracking-widest text-red-500/70 mb-3">Before StudyForge</p>
                <ul className="space-y-2 text-sm text-[#A0A0A0]">
                  <li>😩 &quot;I don&apos;t know where to start studying.&quot;</li>
                  <li>📅 &quot;My timetable lasted exactly one day.&quot;</li>
                  <li>😰 &quot;I only realized the deadline was today.&quot;</li>
                  <li>📚 &quot;I spent 2 hours organizing instead of studying.&quot;</li>
                </ul>
              </div>
              <div className="bg-[#1A1A1A] border border-[#10B981]/30 rounded-xl p-6 text-left shadow-[0_0_30px_rgba(16,185,129,0.07)]">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#10B981] mb-3">After StudyForge</p>
                <ul className="space-y-2 text-sm text-[#A0A0A0]">
                  <li>✅ &quot;I open the app. It tells me exactly what to do.&quot;</li>
                  <li>🗓️ &quot;My week is planned. I just have to show up.&quot;</li>
                  <li>🔔 &quot;I got nudged 2 hours before the deadline.&quot;</li>
                  <li>📈 &quot;I can actually see myself improving, week by week.&quot;</li>
                </ul>
              </div>
            </div>
            <p className="text-[#606060] text-sm italic">
              Not just productivity. Clarity. Control. Peace of mind.
            </p>
          </div>
        </section>
      </ScrollReveal>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24 px-6 relative bg-[#111111]/30">
        <ScrollReveal>
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#606060] mb-3">
              Built for real student life
            </p>
            <h2 className="text-3xl md:text-4xl font-black text-[#F0F0F0] tracking-tight mb-4">
              Not features.{" "}
              <span className="text-[#10B981]">Experiences.</span>
            </h2>
            <p className="text-[#A0A0A0] leading-relaxed">
              Every part of StudyForge is designed to make you feel like you&apos;ve got a grip on things —
              even when life is chaotic.
            </p>
          </div>
        </ScrollReveal>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(({ icon: Icon, tag, gradient, title, description, feel }, i) => (
            <ScrollReveal key={title} delay={i * 0.07}>
              <div className="group bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6 cursor-default transition-all duration-200 hover:-translate-y-0.5 hover:border-[#333333] hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)] h-full flex flex-col">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 shadow-[0_2px_8px_rgba(0,0,0,0.3)]`}>
                  <Icon className="w-5 h-5 text-[#F0F0F0]" />
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-[#222222] border border-[#2A2A2A] text-[#606060] mb-3 w-fit">
                  {tag}
                </span>
                <h3 className="text-base font-semibold text-[#F0F0F0] tracking-tight mb-2 group-hover:text-[#10B981] transition-colors">
                  {title}
                </h3>
                <p className="text-sm text-[#A0A0A0] leading-relaxed mb-4 flex-1">{description}</p>
                <p className="text-xs text-[#10B981]/70 italic">{feel}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ── WHY THIS FEELS DIFFERENT ── */}
      <section className="py-24 px-6 border-t border-[#2A2A2A]/50 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#10B981]/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-5xl mx-auto relative z-10">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#606060] mb-3">
                This is different
              </p>
              <h2 className="text-3xl md:text-5xl font-black text-[#F0F0F0] tracking-tight mb-4">
                It&apos;s not just a planner.
                <br />
                <span className="text-[#10B981]">It&apos;s a companion.</span>
              </h2>
              <p className="text-[#A0A0A0] max-w-xl mx-auto leading-relaxed">
                StudyForge doesn&apos;t just organize your day. It guides your growth, quietly — the way
                a really good mentor would.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {whyDifferent.map(({ icon: Icon, title, description }, i) => (
              <ScrollReveal key={title} delay={i * 0.1}>
                <div className="bg-[#1A1A1A]/60 border border-[#2A2A2A] rounded-2xl p-8 text-center hover:border-[#10B981]/30 transition-all duration-300 group">
                  <div className="w-12 h-12 rounded-2xl bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center mx-auto mb-5 group-hover:bg-[#10B981]/20 transition-all duration-300">
                    <Icon className="w-6 h-6 text-[#10B981]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#F0F0F0] mb-3">{title}</h3>
                  <p className="text-sm text-[#A0A0A0] leading-relaxed">{description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 md:py-32 px-6 border-t border-[#2A2A2A]/50 bg-[#1A1A1A]/20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#606060] mb-3">The journey</p>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-[#F0F0F0]">
              Up and running in minutes.
              <br />
              <span className="text-[#10B981]">Transforming in weeks.</span>
            </h2>
          </div>

          <div className="space-y-10 pl-4 md:pl-0">
            {steps.map((s) => (
              <div key={s.step} className="flex items-start gap-6 md:gap-8 group">
                <div className="shrink-0 w-16 h-16 rounded-2xl bg-[#10B981]/10 border border-[#10B981]/30 flex items-center justify-center text-xl font-black text-[#10B981] shadow-[0_0_15px_rgba(16,185,129,0.15)] group-hover:bg-[#10B981] group-hover:text-[#0A0A0A] transition-all duration-300">
                  {s.step}
                </div>
                <div className="pt-2">
                  <h3 className="text-2xl font-bold text-[#F0F0F0] mb-2 group-hover:text-[#10B981] transition-colors">{s.title}</h3>
                  <p className="text-lg text-[#A0A0A0] leading-relaxed mb-1">{s.description}</p>
                  <p className="text-sm text-[#606060] italic">{s.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="relative py-28 px-6 overflow-hidden border-t border-[#2A2A2A]/50">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#10B981]/8 blur-[100px] rounded-full pointer-events-none" />
        <ScrollReveal direction="up" className="relative z-10">
          <div className="relative z-10 max-w-2xl mx-auto text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#606060] mb-4">Stop waiting for motivation</p>
            <h2 className="text-3xl md:text-5xl font-black text-[#F0F0F0] tracking-tight mb-4">
              Your future self will
              <br />
              <span className="text-[#10B981]">thank you for this.</span>
            </h2>
            <p className="text-[#A0A0A0] mb-2 leading-relaxed">
              Thousands of students replaced chaos with clarity using StudyForge.
              It didn&apos;t require more discipline — just a better system.
            </p>
            <p className="text-sm text-[#606060] italic mb-10">
              &quot;Finally, someone who keeps you on track when motivation fades.&quot;
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/auth/signup">
                <Button size="xl" className="h-14 px-10 text-lg font-bold bg-[#10B981] hover:bg-[#34D399] text-[#0A0A0A] shadow-[0_0_0_1px_rgba(16,185,129,0.3),0_0_20px_rgba(16,185,129,0.15)] hover:shadow-[0_0_0_1px_rgba(16,185,129,0.5),0_0_40px_rgba(16,185,129,0.25)] transition-all duration-150 group active:scale-[0.97]">
                  Start My Smart Journey
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
            <p className="text-xs text-[#3A3A3A] mt-4">Free forever. No credit card. No excuses. ✨</p>
          </div>
        </ScrollReveal>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-[#2A2A2A] bg-[#111111] py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between gap-10 mb-10">
            <div className="max-w-xs">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#10B981] to-[#059669]" />
                <span className="font-bold text-[#F0F0F0] text-sm tracking-tight">StudyForge AI</span>
              </div>
              <p className="text-sm text-[#606060] leading-relaxed">
                Not just a planner. A partner for your academic journey.
                <br />Built with ❤️ by students, for students.
              </p>
            </div>
            <div className="flex gap-16">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#3A3A3A] mb-3">Product</p>
                <div className="space-y-2">
                  <Link href="/dashboard" className="block text-sm text-[#606060] hover:text-[#A0A0A0] transition-colors duration-150">Dashboard</Link>
                  <Link href="/pricing" className="block text-sm text-[#606060] hover:text-[#A0A0A0] transition-colors duration-150">Pricing</Link>
                  <Link href="/auth/signup" className="block text-sm text-[#606060] hover:text-[#A0A0A0] transition-colors duration-150">Sign Up</Link>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#3A3A3A] mb-3">Account</p>
                <div className="space-y-2">
                  <Link href="/auth/login" className="block text-sm text-[#606060] hover:text-[#A0A0A0] transition-colors duration-150">Login</Link>
                  <Link href="/auth/signup" className="block text-sm text-[#606060] hover:text-[#A0A0A0] transition-colors duration-150">Create Account</Link>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-[#2A2A2A] pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-xs text-[#606060]">© 2026 StudyForge AI. Made in India 🇮🇳</p>
            <div className="flex items-center gap-6">
              <Link href="/auth/login" className="text-xs text-[#606060] hover:text-[#A0A0A0] transition-colors">Login</Link>
              <Link href="/auth/signup" className="text-xs text-[#606060] hover:text-[#A0A0A0] transition-colors">Sign Up</Link>
              <Link href="/dashboard" className="text-xs text-[#606060] hover:text-[#A0A0A0] transition-colors">Dashboard</Link>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}

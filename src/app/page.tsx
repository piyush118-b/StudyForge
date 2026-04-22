import Link from "next/link";
import {
  ArrowRight, Brain, CheckSquare, Timer, BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

const steps = [
  {
    step: "01",
    title: "Input your details",
    description: "Provide your subjects, upcoming deadlines, and daily availability.",
  },
  {
    step: "02",
    title: "AI builds your plan",
    description: "Our engine instantly generates an optimized, clash-free schedule.",
  },
  {
    step: "03",
    title: "Track & improve",
    description: "Execute your tasks, log your progress, and view insightful analytics.",
  },
];

const features = [
  {
    icon: Brain,
    tag: "Smart Scheduling",
    title: "Adaptive study plans.",
    description: "Schedules that adjust when life happens. Never worry about falling behind again.",
    gradient: "from-indigo-500 to-violet-600",
  },
  {
    icon: CheckSquare,
    tag: "Task Management",
    title: "Unified workspace.",
    description: "Assignments, projects, and exams tracked in one clear, prioritized view.",
    gradient: "from-orange-500 to-amber-600",
  },
  {
    icon: Timer,
    tag: "Focus Mode",
    title: "Deep work sessions.",
    description: "Integrated timers and distraction-free environments for maximum productivity.",
    gradient: "from-emerald-500 to-teal-600",
  }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#111111] text-[#F0F0F0] overflow-x-hidden selection:bg-[#10B981]/30">

      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-[#2A2A2A] bg-[#111111]/90 backdrop-blur-xl">
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
              <Button variant="ghost" size="sm" className="text-[#A0A0A0] hover:text-[#F0F0F0] hover:bg-[#1A1A1A]">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm" className="bg-[#10B981] hover:bg-[#34D399] text-[#0A0A0A] font-bold shadow-[0_0_0_1px_rgba(16,185,129,0.3)] transition-all duration-150 px-5">
                Start Free →
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6">
        <div className="relative z-10 text-center max-w-4xl mx-auto pt-20">
          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.05] text-[#F0F0F0] mb-8">
            Your studies,{" "}
            <span className="bg-gradient-to-r from-[#10B981] via-[#34D399] to-[#14B8A6] bg-clip-text text-transparent">
              engineered.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-[#A0A0A0] max-w-2xl mx-auto leading-relaxed mb-12">
            Replace chaos with an intelligent system. Let AI build your schedule, manage your tasks, and help you focus on what actually matters.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="xl" className="w-full sm:w-auto h-14 px-10 text-lg font-bold bg-[#10B981] hover:bg-[#34D399] text-[#0A0A0A] shadow-[0_0_0_1px_rgba(16,185,129,0.3)] transition-all duration-150 group">
                Start for Free
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-32 px-6 border-t border-[#2A2A2A]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-[#F0F0F0]">
              How it works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {steps.map((s) => (
              <div key={s.step} className="flex flex-col items-center text-center group">
                <div className="w-16 h-16 rounded-2xl bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-xl font-black text-[#10B981] mb-8 group-hover:border-[#10B981]/50 transition-all duration-300">
                  {s.step}
                </div>
                <h3 className="text-2xl font-bold text-[#F0F0F0] mb-4">{s.title}</h3>
                <p className="text-lg text-[#A0A0A0] leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CORE FEATURES ── */}
      <section className="py-32 px-6 border-t border-[#2A2A2A]">
        <ScrollReveal>
          <div className="text-center mb-24 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-black text-[#F0F0F0] tracking-tight">
              Core Features
            </h2>
          </div>
        </ScrollReveal>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map(({ icon: Icon, tag, gradient, title, description }, i) => (
            <ScrollReveal key={title} delay={i * 0.1}>
              <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-8 transition-all duration-200 hover:-translate-y-1 hover:border-[#333333] h-full flex flex-col">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-6 shadow-sm`}>
                  <Icon className="w-6 h-6 text-[#F0F0F0]" />
                </div>
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold uppercase tracking-wider bg-[#111111] border border-[#2A2A2A] text-[#10B981] mb-4 w-fit">
                  {tag}
                </span>
                <h3 className="text-xl font-bold text-[#F0F0F0] mb-3">
                  {title}
                </h3>
                <p className="text-base text-[#A0A0A0] leading-relaxed flex-1">{description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="relative py-32 px-6 border-y border-[#2A2A2A]">
        <ScrollReveal direction="up" className="relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-black text-[#F0F0F0] tracking-tight mb-8">
              Ready to simplify your studies?
            </h2>
            <div className="flex justify-center">
              <Link href="/auth/signup">
                <Button size="xl" className="h-14 px-10 text-lg font-bold bg-[#10B981] hover:bg-[#34D399] text-[#0A0A0A] shadow-[0_0_0_1px_rgba(16,185,129,0.3)] transition-all duration-150 group active:scale-[0.97]">
                  Start Free
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#111111] py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.4)]">
              <BookOpen className="w-3 h-3 text-[#F0F0F0]" />
            </div>
            <span className="font-bold text-[#F0F0F0] text-sm tracking-tight">StudyForge AI</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/auth/login" className="text-sm text-[#8A8A8A] hover:text-[#F0F0F0] transition-colors">Login</Link>
            <Link href="/auth/signup" className="text-sm text-[#8A8A8A] hover:text-[#F0F0F0] transition-colors">Sign Up</Link>
            <Link href="/dashboard" className="text-sm text-[#8A8A8A] hover:text-[#F0F0F0] transition-colors">Dashboard</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}

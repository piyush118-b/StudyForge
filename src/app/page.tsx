import Link from "next/link";
import { ArrowRight, Zap, ShieldCheck, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 overflow-hidden relative selection:bg-teal-500/30">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-500/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-4xl text-center z-10 space-y-8 mt-12 md:mt-24">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm md:text-base font-medium text-teal-300 mx-auto backdrop-blur-sm shadow-xl shadow-teal-900/10">
          <Zap className="w-4 h-4" />
          <span>Gemini 2.5 Flash Powered</span>
        </div>

        {/* Hero Headlines */}
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white via-white/90 to-white/50 pb-2">
          Stop wasting time making timetables.
        </h1>
        <p className="text-xl md:text-3xl font-medium text-white/80 max-w-2xl mx-auto leading-relaxed">
          Let AI build your perfect week in <span className="text-teal-400 font-bold">60 seconds</span>.
        </p>

        {/* Feature Highlights */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm md:text-lg font-medium text-white/60">
          <span className="flex items-center gap-1"><Zap className="w-4 h-4 text-indigo-400"/> Fun onboarding</span>
          <span>•</span>
          <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-indigo-400"/> Clash-free</span>
          <span>•</span>
          <span className="flex items-center gap-1"><GraduationCap className="w-4 h-4 text-indigo-400"/> Made for Indian students</span>
        </div>

        {/* CTA Button */}
        <div className="pt-8 pb-4">
          <Link href="/create">
            <Button size="lg" className="h-16 px-10 rounded-2xl text-lg font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-2xl shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95 group">
              Create My Timetable Free
              <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* Trust Bar */}
        <div className="pt-16 md:pt-24 flex flex-col items-center gap-3">
          <p className="text-sm font-semibold text-white/40 uppercase tracking-widest">
            Trusted by yaar & dost everywhere
          </p>
          <div className="flex items-center gap-[-8px]">
            {[1,2,3,4,5].map((i) => (
              <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-gradient-to-br from-indigo-400 to-teal-400 ml-[-12px] first:ml-0 flex items-center justify-center text-xs font-bold shadow-sm">
                S{i}
              </div>
            ))}
            <div className="pl-6 text-sm font-medium text-white/70">
              10,000+ students organized
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

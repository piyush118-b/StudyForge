"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit3, Flame, BookOpen } from "lucide-react";
import Link from "next/link";

export default function CreateSelectionPage() {
  const router = useRouter();

  const options = [
    {
      title: "Manual Mode",
      description: "Build your perfect schedule from scratch using our intuitive drag-and-drop editor. Total control over every subject and study block.",
      icon: Edit3,
      href: "/create/timetable",
      color: "from-[#2A2A2A] to-[#1F1F1F]",
      btnColor: "bg-[#222222] hover:bg-[#2A2A2A] text-[#F0F0F0] border border-[#333333]",
      iconBg: "bg-[#222222] border border-[#333333]",
      iconColor: "text-[#A0A0A0]",
      shadow: "hover:shadow-[0_8px_32px_rgba(255,255,255,0.02)] hover:border-[#333333]",
      features: ["Custom Blocks", "Stickers & Themes", "Full Control"]
    },
    {
      title: "Generate with AI",
      description: "Let Gemini AI analyze your goals, energy levels, and commitments to build an optimized, personalized study plan in seconds.",
      icon: Flame,
      href: "/create/ai",
      color: "from-[rgba(16,185,129,0.08)] to-[rgba(16,185,129,0.02)]",
      btnColor: "bg-[#10B981] hover:bg-[#34D399] text-[#0A0A0A] shadow-[0_0_0_1px_rgba(16,185,129,0.3),0_0_20px_rgba(16,185,129,0.15)]",
      iconBg: "bg-gradient-to-br from-[#10B981] to-[#059669]",
      iconColor: "text-white",
      shadow: "hover:shadow-[0_8px_32px_rgba(16,185,129,0.15)] hover:border-[#10B981]/50 border-transparent",
      features: ["Smart Subjects", "Energy Tracking", "Auto Optimization"],
      premium: true
    }
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#10B981]/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Dot grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,#1F1F1F_1px,transparent_1px)] bg-[size:28px_28px] opacity-40 pointer-events-none" />

      <div className="w-full max-w-4xl flex flex-col items-center z-10 animate-[forge-fade-in_0.4s_ease-out_forwards]">

        {/* Header */}
        <div className="space-y-3 text-center mb-16">
          <div className="flex items-center justify-center gap-2.5 mb-6 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)] group-hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all duration-300">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-[#F0F0F0] tracking-tight">StudyForge <span className="text-[#10B981] font-normal">AI</span></span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-[#F0F0F0] tracking-tight">
            How would you like to build your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] to-[#34D399]">Timetable?</span>
          </h1>
          <p className="text-[#A0A0A0] text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            Choose between AI-powered optimization or complete manual control.
          </p>
        </div>

        {/* Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
          {options.map((opt, idx) => {
            const isDisabled = opt.title === "Generate with AI";
            
            return (
              <Link
                key={opt.title}
                href={isDisabled ? "#" : opt.href}
                onClick={(e) => { if(isDisabled) e.preventDefault(); }}
                className={`
                  group relative border rounded-[24px] p-8 flex flex-col
                  transition-all duration-300 ${opt.shadow}
                  animate-[forge-fade-in_0.4s_ease-out_forwards]
                  ${isDisabled ? 'bg-[#121212] border-[#1F1F1F] opacity-70 cursor-not-allowed' : 'bg-[#1A1A1A] border-[#2A2A2A] active:scale-[0.98]'}
                `}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {/* Subtle Inner Gradient */}
                <div className={`absolute inset-0 rounded-[24px] bg-gradient-to-br ${isDisabled ? 'hidden' : opt.color} pointer-events-none opacity-50`} />

                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-6">
                    <div className={`w-12 h-12 rounded-2xl ${isDisabled ? 'bg-[#1A1A1A] border border-[#2A2A2A]' : opt.iconBg} flex items-center justify-center shadow-lg transition-transform duration-300 ${!isDisabled && 'group-hover:scale-110 group-hover:-rotate-3'}`}>
                      <opt.icon className={`w-6 h-6 ${isDisabled ? 'text-[#606060]' : opt.iconColor}`} />
                    </div>
                    {opt.premium && (
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${isDisabled ? 'bg-[#1A1A1A] text-[#606060] border-[#2A2A2A]' : 'bg-[rgba(16,185,129,0.1)] text-[#10B981] border-[#10B981]/20'}`}>
                        Premium AI
                      </span>
                    )}
                  </div>

                  <h3 className={`text-xl font-bold mb-2 ${isDisabled ? 'text-[#A0A0A0]' : 'text-[#F0F0F0]'}`}>{opt.title}</h3>
                  <p className="text-[#808080] text-sm leading-relaxed mb-8 flex-1">
                    {opt.description}
                  </p>

                  {/* Features List */}
                  <ul className="space-y-2.5 mb-8">
                    {opt.features.map(f => (
                      <li key={f} className={`flex items-center text-[13px] font-medium ${isDisabled ? 'text-[#606060]' : 'text-[#A0A0A0]'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full mr-2.5 ${isDisabled ? 'bg-[#333333]' : (opt.premium ? 'bg-[#10B981]' : 'bg-[#606060]')}`} />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <div className={`w-full h-11 rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-200 mt-auto ${isDisabled ? 'bg-[#1A1A1A] text-[#606060] border border-[#2A2A2A]' : opt.btnColor}`}>
                    {isDisabled ? "Upgrade to Unlock AI" : (opt.title === "Manual Mode" ? "Enter Studio" : "Start Generation")}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Footer Link */}
        <div className="mt-12 text-center animate-[forge-fade-in_0.8s_ease-out_forwards]">
          <Link href="/dashboard">
            <Button variant="ghost" className="text-[#606060] hover:text-[#A0A0A0] hover:bg-transparent group h-auto p-2">
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

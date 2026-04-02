"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit3, Flame, Sparkles, LayoutGrid, BookOpen } from "lucide-react";
import Link from "next/link";

export default function CreateSelectionPage() {
  const router = useRouter();

  const options = [
    {
      title: "Manual Mode",
      description: "Build your perfect schedule from scratch using our intuitive drag-and-drop editor. Total control over every subject and study block.",
      icon: Edit3,
      href: "/create/timetable",
      color: "from-teal-500 to-emerald-600",
      glow: "bg-teal-500/20",
      features: ["Custom Blocks", "Stickers & Themes", "Full Control"]
    },
    {
      title: "Generate with AI",
      description: "Let Gemini AI analyze your goals, energy levels, and commitments to build an optimized, personalized study plan in seconds.",
      icon: Flame,
      href: "/create/ai",
      color: "from-indigo-600 to-purple-600",
      glow: "bg-indigo-500/20",
      features: ["Smart Subjects", "Energy Tracking", "Auto Optimization"],
      premium: true
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[500px] h-[500px] bg-teal-500/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="w-full max-w-4xl flex flex-col items-center z-10">
        
        {/* Header */}
        <div className="space-y-3 text-center mb-16 animate-in fade-in slide-in-from-top-10 duration-700">
           <div className="flex items-center justify-center gap-2.5 mb-6">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-white tracking-tight tracking-wider">StudyForge <span className="text-indigo-400 font-normal">AI</span></span>
           </div>
           <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl">
             How would you like to build your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-teal-400">Timetable?</span>
           </h1>
           <p className="text-slate-400 text-lg max-w-xl mx-auto">
             Choose between AI-powered optimization or complete manual control.
           </p>
        </div>

        {/* Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl">
           {options.map((opt, idx) => (
             <div 
               key={opt.title}
               className="group relative rounded-3xl p-1 overflow-hidden transition-all hover:scale-[1.02] active:scale-95 duration-300 animate-in fade-in zoom-in-95"
               style={{ animationDelay: `${idx * 150}ms` }}
             >
                {/* Border Glow Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${opt.color} opacity-20 group-hover:opacity-40 transition-opacity`} />
                
                <div className="relative h-full bg-slate-900 border border-slate-800 rounded-[22px] p-8 flex flex-col">
                   <div className="flex justify-between items-start mb-6">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${opt.color} flex items-center justify-center shadow-2xl group-hover:rotate-6 transition-transform duration-500`}>
                         <opt.icon className="w-7 h-7 text-white" />
                      </div>
                      {opt.premium && (
                        <span className="bg-indigo-500/10 text-indigo-400 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full border border-indigo-500/20">
                          AI Enabled
                        </span>
                      )}
                   </div>

                   <h3 className="text-2xl font-bold text-white mb-3">{opt.title}</h3>
                   <p className="text-slate-400 text-sm leading-relaxed mb-8 flex-1">
                      {opt.description}
                   </p>

                   {/* Features List */}
                   <ul className="space-y-2 mb-8">
                     {opt.features.map(f => (
                       <li key={f} className="flex items-center text-xs text-slate-500 font-medium">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-700 mr-2 group-hover:bg-indigo-400 transition-colors" />
                          {f}
                       </li>
                     ))}
                   </ul>

                   <Link href={opt.href} className="block mt-auto">
                     <Button className={`w-full h-12 rounded-xl bg-gradient-to-r ${opt.color} text-white font-semibold shadow-lg transition-shadow hover:shadow-[0_0_20px_rgba(79,70,229,0.4)]`}>
                        {opt.title === "Manual Mode" ? "Enter Studio" : "Start Generation"}
                     </Button>
                   </Link>
                </div>
             </div>
           ))}
        </div>

        {/* Footer Link */}
        <div className="mt-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
           <Link href="/dashboard">
             <Button variant="ghost" className="text-slate-500 hover:text-white group">
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Dashboard
             </Button>
           </Link>
        </div>
      </div>
    </div>
  );
}

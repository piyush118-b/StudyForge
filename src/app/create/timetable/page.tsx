"use client";

import { useEffect, useState, useRef } from "react";
import { TimetableGridEditor } from "@/components/editor/TimetableGridEditor";
import { useGridStore } from "@/store/grid-store";
import { ExportButton } from "@/components/timetable/ExportButton";
import { SaveTimetableModal } from "@/components/timetable/SaveTimetableModal";
import { useAuth } from "@/lib/auth-context";
import { TimetableData, TimetableSlot } from "@/lib/types";
import { ArrowLeft, Clock, Save, Share2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { DayColumn } from "@/lib/grid-engine";

export default function TimetableStudioPage() {
  const router = useRouter();
  const { initGrid, addBlock, blocks } = useGridStore();
  const { user } = useAuth();
  const isImported = useRef(false);
  const [data, setData] = useState<TimetableData | null>(null);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("studyforge_timetable");
    let ttData: TimetableData | null = null;
    
    if (saved) {
      try {
        ttData = JSON.parse(saved);
        setData(ttData);
      } catch (e) {
        console.error("Failed to load timetable", e);
      }
    }

    // Initialize the advanced editor grid
    const cols: DayColumn[] = [
      { id: 'col_monday', label: 'Monday', isCustom: false, isHidden: false, widthPx: 160 },
      { id: 'col_tuesday', label: 'Tuesday', isCustom: false, isHidden: false, widthPx: 160 },
      { id: 'col_wednesday', label: 'Wednesday', isCustom: false, isHidden: false, widthPx: 160 },
      { id: 'col_thursday', label: 'Thursday', isCustom: false, isHidden: false, widthPx: 160 },
      { id: 'col_friday', label: 'Friday', isCustom: false, isHidden: false, widthPx: 160 },
      { id: 'col_saturday', label: 'Saturday', isCustom: false, isHidden: false, widthPx: 160 },
      { id: 'col_sunday', label: 'Sunday', isCustom: false, isHidden: false, widthPx: 160 },
    ];
    
    initGrid('draft', cols, "07:00", "23:00");

    // If we have AI-generated data, import it into the interactive Studio Store
    if (ttData && !isImported.current) {
      isImported.current = true;
      Object.entries(ttData.grid).forEach(([day, slots]) => {
        // Capitalize first letter to match DayOfWeek ('Monday', 'Tuesday', etc.)
        const dayName = (day.charAt(0).toUpperCase() + day.slice(1).toLowerCase()) as any;
        Object.entries(slots).forEach(([time, slot]: [string, any]) => {
          const [start, end] = time.split('-');
          addBlock({
            day: dayName,
            startTime: start,
            endTime: end,
            subject: slot.subject,
            subjectType: slot.type,
            color: slot.color || "#4f46e5",
            notes: slot.notes || "",
            priority: slot.priority || "Medium",
            sticker: slot.sticker || null
          });
        });
      });
      toast.success("Imported AI findings into your Studio!");
    }
  }, [initGrid, addBlock]);

  return (
    <div className="w-full h-screen bg-[#13141A] flex flex-col overflow-hidden">
      {/* Studio Header (Integrated with Advanced Editor) */}
      <header className="h-16 flex items-center justify-between px-6 bg-[#1A1B24]/80 backdrop-blur-xl border-b border-white/5 z-[200] relative">
        <div className="flex items-center gap-6">
           <Button variant="ghost" size="icon" onClick={() => router.push('/create')} className="text-slate-400 hover:text-white group">
             <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
           </Button>
           
           <div className="h-8 w-px bg-white/10" />

           <div>
              <div className="flex items-center gap-2 mb-0.5">
                 <h1 className="text-sm font-bold text-slate-100 tracking-wide uppercase">{data?.title || "Draft Timetable"}</h1>
                 <span className="text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 rounded uppercase tracking-widest">
                   Studio
                 </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Auto-saving to temporary session...</p>
           </div>
        </div>

        <div className="flex items-center gap-3">
           <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white hover:bg-white/5 font-semibold text-xs tracking-wide">
             Draft Tools
           </Button>
           
           <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/5">
             <ExportButton targetId="timetable-studio-container" />
             <Button variant="secondary" size="sm" className="font-bold text-xs" onClick={() => setIsSaveModalOpen(true)}>
               <Save className="w-3.5 h-3.5 mr-2" /> Save Timetable
             </Button>
           </div>
        </div>
      </header>

      {/* Save Modal */}
      <SaveTimetableModal 
         isOpen={isSaveModalOpen} 
         onOpenChange={setIsSaveModalOpen} 
         gridData={blocks} 
         isGuest={!user} 
      />

      {/* Advanced Studio Editor Wrapper */}
      <main id="timetable-studio-container" className="flex-1 relative">
         <TimetableGridEditor timetableId="draft" />
      </main>
    </div>
  );
}

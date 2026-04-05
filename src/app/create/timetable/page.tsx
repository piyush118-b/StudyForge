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
    if (ttData?.grid && !isImported.current) {
      isImported.current = true;
      Object.entries(ttData.grid).forEach(([dayName, slots]) => {
        const day = dayName.charAt(0).toUpperCase() + dayName.slice(1).toLowerCase() as any; // Ensure 'Monday' format
        Object.entries(slots).forEach(([time, slot]: [string, any]) => {
          const [start, end] = time.split('-');
          addBlock({
            day,
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
    <div className="w-full h-screen bg-[#0A0A0A] flex flex-col overflow-hidden">
      {/* Studio Header (Integrated with Advanced Editor) */}
      <header className="h-14 flex items-center justify-between px-4 bg-[#111111] border-b border-[#2A2A2A] z-[200] relative flex-shrink-0">
        <div className="flex items-center gap-3">
           <button onClick={() => router.push('/create')} className="w-9 h-9 rounded-lg flex items-center justify-center text-[#A0A0A0] hover:text-[#F0F0F0] hover:bg-[#222222] transition-all">
             <ArrowLeft className="w-4 h-4" />
           </button>
           
           <div className="w-px h-5 bg-[#2A2A2A]" />

           <div>
              <div className="flex items-center gap-2">
                 <h1 className="text-sm font-bold text-[#F0F0F0] tracking-wide">{data?.title || "Draft Timetable"}</h1>
                 <span className="text-[10px] font-bold bg-[rgba(16,185,129,0.1)] text-[#10B981] border border-[#10B981]/20 px-1.5 py-0.5 rounded uppercase tracking-widest">
                   Studio
                 </span>
              </div>
              <p className="text-[11px] text-[#606060] font-medium">Auto-saving to temporary session...</p>
           </div>
        </div>

        <div className="flex items-center gap-2">
           <div className="flex items-center gap-2">
             <ExportButton targetId="timetable-studio-container" />
             <button
               onClick={() => setIsSaveModalOpen(true)}
               className="h-9 px-4 rounded-lg text-sm font-bold bg-[#10B981] text-[#0A0A0A] shadow-[0_0_0_1px_rgba(16,185,129,0.3),0_0_16px_rgba(16,185,129,0.15)] hover:bg-[#34D399] transition-all duration-150 active:scale-[0.97] flex items-center gap-1.5"
             >
               <Save className="w-3.5 h-3.5" /> Save Timetable
             </button>
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

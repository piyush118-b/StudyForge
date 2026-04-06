"use client";

import { TimetableData, TimetableSlot } from "@/lib/types";
import { TimetableBlock } from "./TimetableBlock";

interface Props {
  data: TimetableData;
  onUpdateSlot: (day: string, time: string, updated: TimetableSlot) => void;
}

export function WeeklyGrid({ data, onUpdateSlot }: Props) {
  const { days, timeSlots, grid } = data;

  return (
    <div className="w-full overflow-x-auto custom-scrollbar border border-white/10 rounded-xl bg-[#111111] shadow-2xl">
      <div className="min-w-[800px] w-full items-stretch flex flex-col hidden sm:flex">
        {/* Header Row */}
        <div className="flex bg-slate-950 border-b border-white/5 sticky top-0 z-10">
          <div className="w-20 lg:w-24 shrink-0 flex-none border-r border-white/5 p-3 flex items-center justify-center font-semibold text-[#A0A0A0] text-xs uppercase tracking-wider">
            Time
          </div>
          {days.map(day => (
            <div key={day} className="flex-1 text-center font-bold text-[#F0F0F0] p-3 border-r border-white/5 last:border-r-0 tracking-wide text-sm">
              {day}
            </div>
          ))}
        </div>

        {/* Time Rows */}
        <div className="flex flex-col">
          {timeSlots.map(time => (
            <div key={time} className="flex border-b border-white/5 last:border-b-0 min-h-[80px]">
              <div className="w-20 lg:w-24 shrink-0 flex-none border-r border-white/5 p-2 flex items-center justify-center text-xs font-medium text-[#606060]">
                {time}
              </div>
              {days.map(day => {
                const slot = grid[day]?.[time];
                return (
                  <div key={`${day}-${time}`} className="flex-1 p-1 border-r border-white/5 last:border-r-0 bg-[#111111]/50 hover:bg-[#1A1A1A]/50 transition-all duration-150-colors">
                    {slot ? (
                      <TimetableBlock 
                        slotContent={slot} 
                        timeLabel={`${day} ${time}`}
                        onUpdate={(updated) => onUpdateSlot(day, time, updated)} 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-[#F0F0F0]/10 text-[10px]">—</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile View - Vertical Daily View */}
      <div className="flex flex-col sm:hidden p-4 space-y-8">
        {days.map(day => (
          <div key={day} className="space-y-3">
            <h3 className="text-lg font-bold text-teal-400 border-b border-white/10 pb-2">{day}</h3>
            <div className="space-y-2">
              {timeSlots.map(time => {
                const slot = grid[day]?.[time];
                if (!slot) return null;
                return (
                  <div key={time} className="flex gap-3">
                    <div className="w-16 shrink-0 text-xs font-medium text-[#606060] flex items-start pt-1">
                      {time.split("-")[0]}
                    </div>
                    <div className="flex-1 min-h-[60px]">
                      <TimetableBlock 
                        slotContent={slot} 
                        timeLabel={`${day} ${time}`}
                        onUpdate={(updated) => onUpdateSlot(day, time, updated)} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

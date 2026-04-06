"use client";

import { useGridStore } from "@/store/grid-store";
import { TimeBlockComponent } from "./TimeBlock";
import { useState, useRef, useEffect, MouseEvent } from "react";
import { timeToPixel, pixelToTime, snapTime, timeDiffMinutes, to12HourShort, to12Hour } from "@/lib/time-utils";

const TIME_LABEL_WIDTH = 72;
const DAY_HEADER_HEIGHT = 56;

export function TimetableGrid() {
  const { gridStartTime, gridEndTime, pxPerHour, dayColumns, blocks, currentSnapInterval, openBlockModal, zoom, activeTool } = useGridStore();
  const gridRef = useRef<HTMLDivElement>(null);

  const totalMinutes = timeDiffMinutes(gridStartTime, gridEndTime);
  const totalGridHeight = (totalMinutes / 60) * pxPerHour;
  
  const columnLefts = dayColumns.reduce((acc, col, idx) => {
    const prevLeft = idx === 0 ? TIME_LABEL_WIDTH : acc[idx - 1];
    const prevWidth = idx === 0 ? 0 : dayColumns[idx - 1].widthPx;
    acc.push(prevLeft + prevWidth);
    return acc;
  }, [] as number[]);

  const totalWidth = TIME_LABEL_WIDTH + dayColumns.reduce((acc, c) => acc + c.widthPx, 0);
  const totalHeight = DAY_HEADER_HEIGHT + totalGridHeight;

  // Feature 3: Crosshair
  const [crosshairY, setCrosshairY] = useState<number | null>(null);
  const [crosshairTime, setCrosshairTime] = useState<string>('');

  // Feature 1: Drag to Create
  const [dragCreate, setDragCreate] = useState<{
    day: string;
    startY: number;      
    currentY: number;    
    startTime: string;   
    endTime: string;     
  } | null>(null);

  // Generate exact hour and half-hour visual guide points mathematically
  const gridLines: { y: number; isMajor: boolean | 'micro' }[] = [];
  const labels: { y: number; isHour: boolean; label: string; time: string }[] = [];
  
  const startH = parseInt(gridStartTime.split(":")[0]);
  const durationMinutes = timeDiffMinutes(gridStartTime, gridEndTime);
  const totalHours = Math.ceil(durationMinutes / 60);

  for (let hOffset = 0; hOffset <= totalHours; hOffset++) {
    const currentH = (startH + hOffset) % 24;
    const timeFull = `${currentH.toString().padStart(2, '0')}:00`;
    const yFull = timeToPixel(timeFull, gridStartTime, pxPerHour);
    
    // Check if we already added this hour (could happen at exact end boundary)
    if (yFull >= 0 && yFull <= totalGridHeight) {
      gridLines.push({ y: yFull, isMajor: true });
      labels.push({ y: yFull, isHour: true, label: to12HourShort(timeFull), time: timeFull });
    }
    
    // Half-hour markers
    if (hOffset < totalHours) {
      const timeHalf = `${currentH.toString().padStart(2, '0')}:30`;
      const yHalf = timeToPixel(timeHalf, gridStartTime, pxPerHour);
      if (yHalf > 0 && yHalf < totalGridHeight) {
        gridLines.push({ y: yHalf, isMajor: false });
        labels.push({ y: yHalf, isHour: false, label: ':30', time: timeHalf });
      }
      
      // Faint 15min marks at deep zoom
      if (zoom > 1.3) {
         ['15', '45'].forEach(m => {
            const tQuart = `${currentH.toString().padStart(2, '0')}:${m}`;
            const yQ = timeToPixel(tQuart, gridStartTime, pxPerHour);
            if (yQ > 0 && yQ < totalGridHeight) {
               gridLines.push({ y: yQ, isMajor: 'micro' });
            }
         });
      }
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!gridRef.current) return;
    const rect = gridRef.current.getBoundingClientRect();
    const y = (e.clientY - rect.top - DAY_HEADER_HEIGHT * zoom) / zoom;
    
    // Crosshair logic
    if (y >= 0 && y <= totalGridHeight) {
      setCrosshairY(y);
      setCrosshairTime(to12Hour(pixelToTime(y, gridStartTime, pxPerHour)));
    } else {
      setCrosshairY(null);
    }

    // Drag Create logic
    if (dragCreate) {
      const minY = dragCreate.startY + (15 / 60 * pxPerHour);
      const clampedY = Math.max(y, minY);
      
      const rawEnd = pixelToTime(clampedY, gridStartTime, pxPerHour);
      const snappedEnd = currentSnapInterval ? snapTime(rawEnd, currentSnapInterval) : rawEnd;
      const finalY = timeToPixel(snappedEnd, gridStartTime, pxPerHour);
      
      setDragCreate(prev => ({ ...prev!, currentY: finalY, endTime: snappedEnd }));
    }
  };

  const handleMouseLeave = () => {
    setCrosshairY(null);
    if (dragCreate) {
      setDragCreate(null); // Cancel drag if mouse leaves entirely
    }
  };

  const handleMouseUp = () => {
    if (!dragCreate) return;
    const duration = timeDiffMinutes(dragCreate.startTime, dragCreate.endTime);
    if (duration < 15) {
      openBlockModal(dragCreate.day as any, dragCreate.startTime, dragCreate.endTime);
    } else {
      openBlockModal(dragCreate.day as any, dragCreate.startTime, dragCreate.endTime);
    }
    setDragCreate(null);
  };

  return (
    <div 
      ref={gridRef}
      className="relative font-sans select-none"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleMouseUp}
      style={{
        width: `${Math.max(window.innerWidth * 2, totalWidth)}px`,
        height: `${Math.max(window.innerHeight * 2, totalHeight)}px`,
        backgroundColor: "var(--color-forge-base)",
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 1px, transparent 0)',
        backgroundSize: '24px 24px',
        "--grid-line": "var(--color-forge-border)"
      } as any}
    >
      {/* Visual Lines (Faint Structure Overlay) */}
      {gridLines.map((gl, i) => (
        <div
          key={`hline-${i}`}
          className={`absolute left-[72px] right-0 pointer-events-none ${
            gl.isMajor === true
              ? 'h-px bg-[#1F1F1F]'
              : 'h-px border-t border-dashed border-[#181818]'
          }`}
          style={{ top: `${DAY_HEADER_HEIGHT + gl.y}px` }}
        />
      ))}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
        <line x1={TIME_LABEL_WIDTH} y1={DAY_HEADER_HEIGHT} x2={totalWidth} y2={DAY_HEADER_HEIGHT} stroke="#1A1A1A" strokeWidth={1} />
        {/* Column dividers (between days) */}
        {dayColumns.map((col, i) => (
          <line key={`v-${col.id}`} x1={columnLefts[i]} y1={DAY_HEADER_HEIGHT} x2={columnLefts[i]} y2={DAY_HEADER_HEIGHT + totalGridHeight} stroke="#1A1A1A" strokeWidth={1} />
        ))}
      </svg>

      {/* Crosshair Graphic Feature 3 */}
      {crosshairY !== null && !dragCreate && (
        <>
          <div style={{
            position: 'absolute',
            left: TIME_LABEL_WIDTH, right: 0, width: totalWidth - TIME_LABEL_WIDTH,
            top: crosshairY + DAY_HEADER_HEIGHT,
            height: 1,
            background: 'var(--color-forge-accent)',
            opacity: 0.4,
            pointerEvents: 'none',
            zIndex: 5
          }} />
          <div style={{
            position: 'absolute',
            left: TIME_LABEL_WIDTH - 60,
            top: crosshairY + DAY_HEADER_HEIGHT - 10,
            background: 'var(--color-forge-accent)',
            color: 'var(--color-forge-base)',
            fontSize: 10,
            padding: '2px 6px',
            borderRadius: 10,
            pointerEvents: 'none',
            zIndex: 6,
            fontWeight: 600
          }}>
            {crosshairTime}
          </div>
        </>
      )}

      {/* Current Time Indicator Feature 4 */}
      <CurrentTimeIndicator dayColumns={dayColumns} columnLefts={columnLefts} gridStartTime={gridStartTime} pxPerHour={pxPerHour} totalGridHeight={totalGridHeight} />

      {/* Axis Headers - Days (X) */}
      {dayColumns.map((col, i) => (
        <div 
          key={col.id} 
          className="absolute flex items-center justify-center font-bold text-forge-text-primary tracking-wide text-[14px] z-30 pointer-events-none"
          style={{ left: columnLefts[i], top: 0, width: col.widthPx, height: DAY_HEADER_HEIGHT }}
        >
          {col.label}
        </div>
      ))}

      {/* Axis Headers - Times / Left Rail (Y) */}
      <div className="absolute z-20 sticky left-0 w-[72px] bg-[#0A0A0A] h-full" style={{ top: DAY_HEADER_HEIGHT, height: totalGridHeight }} />
      {labels.map((lbl, i) => {
        const showMinor = zoom > 0.8;
        if (!lbl.isHour && !showMinor) return null;
        
        return (
          <div
            key={i}
            className="absolute z-25 w-[72px] flex items-start justify-end pr-3 pt-0.5 sticky left-0 bg-[#0A0A0A]"
            style={{ top: DAY_HEADER_HEIGHT + lbl.y }}
          >
            <span className={`font-mono tabular-nums ${lbl.isHour ? 'text-[10px] font-medium text-[#3A3A3A]' : 'text-[9px] font-medium text-[#2A2A2A]'}`}>
              {lbl.label}
            </span>
          </div>
        );
      })}

      {/* Invisible Interactive Day Columns (Dropzones for Drag-Create) */}
      {dayColumns.map((col, cIdx) => (
        <div 
          key={`zone-${col.id}`}
          className={`absolute z-10 hover:bg-[rgba(16,185,129,0.03)] hover:cursor-cell transition-colors duration-100 group`}
          style={{ 
             left: columnLefts[cIdx],
             top: DAY_HEADER_HEIGHT,
             width: col.widthPx,
             height: totalGridHeight
          }}
          onMouseDown={(e) => {
            if (e.button !== 0 || activeTool === 'pan') return;
            const y = (e.clientY - gridRef.current!.getBoundingClientRect().top - DAY_HEADER_HEIGHT * zoom) / zoom;
            const rawTime = pixelToTime(y, gridStartTime, pxPerHour);
            const snappedTime = currentSnapInterval ? snapTime(rawTime, currentSnapInterval) : rawTime;
            const snappedY = timeToPixel(snappedTime, gridStartTime, pxPerHour);
            
            setDragCreate({
              day: col.id,
              startY: snappedY,
              currentY: snappedY,
              startTime: snappedTime,
              endTime: snappedTime
            });
            e.preventDefault();
          }}
        >
           {/* Drag Preview Ghost Overlay */}
           {dragCreate?.day === col.id && (
             <div 
               className="absolute left-[4px] right-[4px] bg-forge-accent/25 border-2 border-dashed border-forge-accent/80 rounded-lg pointer-events-none flex flex-col items-center justify-center shadow-lg backdrop-blur-[2px]"
               style={{
                 top: dragCreate.startY,
                 height: dragCreate.currentY - dragCreate.startY
               }}
             >
               <span className="text-forge-accent font-bold text-xs drop-shadow-md bg-forge-elevated/80 px-2 py-0.5 rounded-full border border-forge-accent/20">
                 {to12HourShort(dragCreate.startTime)} – {to12HourShort(dragCreate.endTime)}
               </span>
               <span className="text-forge-text-primary font-mono text-[10px] mt-1 shadow-sm font-semibold">
                 ({Math.floor(timeDiffMinutes(dragCreate.startTime, dragCreate.endTime) / 60)}h {timeDiffMinutes(dragCreate.startTime, dragCreate.endTime) % 60}m)
               </span>
             </div>
           )}

           {/* Plus hint — shows on hover */}
           {!dragCreate && (
             <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none">
               <div className="w-6 h-6 rounded-full bg-[#10B981]/20 flex items-center justify-center text-[#10B981] text-sm font-bold">
                 +
               </div>
             </div>
           )}
        </div>
      ))}

      {/* Data Extracted Blocks Plane */}
      {Object.values(blocks).map(block => {
        // Robust matching for legacy blocks
        const legacyMap: Record<string, string> = {
          col_monday: 'Monday', col_tuesday: 'Tuesday', col_wednesday: 'Wednesday',
          col_thursday: 'Thursday', col_friday: 'Friday', col_saturday: 'Saturday', col_sunday: 'Sunday'
        };
        const targetId = block.day || legacyMap[(block as any).dayId] || (block as any).dayId;
        const cIdx = dayColumns.findIndex(c => c.id === targetId || legacyMap[c.id] === targetId);
        
        if (cIdx === -1) return null;
        
        const x = columnLefts[cIdx];
        const w = dayColumns[cIdx].widthPx;
        const y = timeToPixel(block.startTime, gridStartTime, pxPerHour);
        const h = timeToPixel(block.endTime, gridStartTime, pxPerHour) - y;

        return (
          <div key={block.id} className="absolute z-30 pointer-events-auto" style={{ left: x, top: DAY_HEADER_HEIGHT + y, width: w, height: h }}>
            <TimeBlockComponent 
              block={block} 
              x={0} 
              y={0} 
              w={w} 
              h={h} 
            />
          </div>
        );
      })}

    </div>
  );
}

function CurrentTimeIndicator({ dayColumns, columnLefts, gridStartTime, pxPerHour, totalGridHeight }: any) {
  const [now, setNow] = useState(new Date());
  
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);
  
  const timeStr = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
  const y = timeToPixel(timeStr, gridStartTime, pxPerHour);
  
  if (totalGridHeight && (y < 0 || y > totalGridHeight)) return null;
  
  return (
    <div
      className="absolute left-0 right-0 z-20 pointer-events-none"
      style={{ top: `${y + DAY_HEADER_HEIGHT}px` }}
    >
      <div className="h-px bg-[#10B981] opacity-70" />
      <div className="absolute left-[72px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#10B981] shadow-[0_0_6px_rgba(16,185,129,0.8)] -translate-x-1/2" />
    </div>
  );
}

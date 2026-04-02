"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useGridStore } from "@/store/grid-store";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

export function CanvasWrapper({ children }: { children: React.ReactNode }) {
  const { zoom, panX, panY, setZoom, setPan, activeTool } = useGridStore();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isSpacePanning, setIsSpacePanning] = useState(false);
  const isPanning = isSpacePanning || activeTool === 'pan';
  
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      // Zoom
      const newZoom = Math.min(Math.max(0.3, zoom * (1 - e.deltaY * 0.005)), 2.0);
      
      // Ideally we would offset the pan toward the cursor here, but keeping it simple for now
      setZoom(Number(newZoom.toFixed(2)));
    } else {
      // Pan
      setPan(panX - e.deltaX, panY - e.deltaY);
    }
  }, [zoom, panX, panY, setZoom, setPan]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isSpacePanning && e.target === document.body) {
        e.preventDefault();
        setIsSpacePanning(true);
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePanning(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isSpacePanning]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning && e.buttons === 1) { // Left click held
      setPan(panX + e.movementX, panY + e.movementY);
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`w-full flex-1 overflow-hidden relative select-none ${isPanning ? 'cursor-grabbing' : 'cursor-auto'}`}
      onMouseMove={handleMouseMove}
      onMouseDown={() => { if(isPanning) document.body.style.cursor = 'grabbing'; }}
      onMouseUp={() => { document.body.style.cursor = ''; }}
      onMouseLeave={() => { document.body.style.cursor = ''; }}
    >
      <div 
        className="absolute origin-top-left transition-transform duration-75"
        style={{
          transform: `scale(${zoom}) translate(${panX / zoom}px, ${panY / zoom}px)`,
          willChange: "transform"
        }}
      >
        {children}
      </div>

      {/* Floating Zoom Controls */}
      <div className="absolute bottom-6 left-6 flex items-center bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden z-50 pointer-events-auto text-slate-300">
         <button className="p-2 hover:bg-slate-700 hover:text-white" onClick={() => setZoom(Math.max(0.3, zoom - 0.1))}>
           <ZoomOut className="w-4 h-4" />
         </button>
         <button className="px-3 hover:bg-slate-700 hover:text-white font-mono text-xs border-x border-slate-700" onClick={() => setZoom(1.0)}>
           {Math.round(zoom * 100)}%
         </button>
         <button className="p-2 hover:bg-slate-700 hover:text-white" onClick={() => setZoom(Math.min(2.0, zoom + 0.1))}>
           <ZoomIn className="w-4 h-4" />
         </button>
         <button className="p-2 hover:bg-slate-700 hover:text-white border-l border-slate-700" onClick={() => { setZoom(1.0); setPan(0, 0); }}>
           <Maximize2 className="w-4 h-4" />
         </button>
      </div>
    </div>
  );
}

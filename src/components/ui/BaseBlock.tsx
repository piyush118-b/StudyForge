import React from 'react';
import { UnifiedBlock, BlockStatus } from '@/types';
import { cn } from '@/lib/utils';
// Note: Icon imports would go here based on requirements. Add placeholder for now
import { CheckCircle, XCircle, GripVertical, Clock } from 'lucide-react';

interface BaseBlockProps {
  block: UnifiedBlock;
  variant: 'grid' | 'dashboard' | 'tracking';
  onStatusChange?: (status: BlockStatus) => void;
  onDragStart?: () => void;
  isEditable?: boolean;
}

export function BaseBlock({
  block,
  variant,
  onStatusChange,
  onDragStart,
  isEditable = false
}: BaseBlockProps) {
  
  const baseClasses = "flex flex-col rounded-lg shadow-sm overflow-hidden border transition-all duration-200 relative group";
  const bgStyle = { backgroundColor: `${block.color}15`, borderColor: `${block.color}30` }; // light bg tint
  
  if (variant === 'grid') {
    return (
      <div 
        className={cn(baseClasses, "w-full h-full p-2 hover:shadow-md cursor-pointer")}
        style={bgStyle}
      >
        <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onDragStart && <GripVertical className="w-4 h-4 text-slate-400 cursor-grab active:cursor-grabbing" onPointerDown={onDragStart} />}
        </div>
        <div className="flex-1 ml-4 overflow-hidden">
           <h4 className="font-semibold text-sm truncate" style={{ color: block.color }}>{block.subject}</h4>
           <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              {block.startTime}
           </div>
        </div>
      </div>
    );
  }

  if (variant === 'tracking') {
    return (
      <div className={cn(baseClasses, "flex-row items-center justify-between p-3")} style={bgStyle}>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: block.color }} />
          <div>
            <h4 className="font-semibold">{block.subject}</h4>
            <div className="text-xs text-muted-foreground">
              {block.startTime} - {block.endTime}
            </div>
          </div>
        </div>
        {isEditable && onStatusChange && (
          <div className="flex items-center gap-2">
            <button onClick={() => onStatusChange('completed')} className="p-1.5 hover:bg-emerald-500/10 rounded-md text-emerald-500 transition-colors" title="Mark Done">
               <CheckCircle className="w-5 h-5" />
            </button>
            <button onClick={() => onStatusChange('skipped')} className="p-1.5 hover:bg-rose-500/10 rounded-md text-rose-500 transition-colors" title="Skip">
               <XCircle className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    );
  }

  // Dashboard minimal view
  return (
    <div className={cn(baseClasses, "p-2")} style={bgStyle}>
      <div className="flex items-start justify-between">
         <h4 className="font-medium text-sm truncate pr-2">{block.subject}</h4>
         <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1" style={{ backgroundColor: block.color }} />
      </div>
      <div className="mt-2 flex items-center text-xs text-muted-foreground gap-1">
         <Clock className="w-3 h-3" />
         <span>{block.startTime}</span>
      </div>
    </div>
  );
}

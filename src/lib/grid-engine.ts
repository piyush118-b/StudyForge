import { GridBlock } from '@/types';
export type { TimeBlock } from '@/types'; // backward-compat alias

export interface DayColumn {
  id: string;                    // unique, e.g. 'col_monday'
  label: string;                 // 'Monday' | 'Tue' | 'Apr 1' | custom
  isCustom: boolean;
  isHidden: boolean;             // for collapsing weekend
  widthPx: number;               // default 160px, user-resizable
}

export interface GridState {
  id: string;                    // timetable id
  
  // Continuous Time Model bounds
  gridStartTime: string;         // '07:00'
  gridEndTime: string;           // '23:00'
  pxPerHour: number;             // e.g. 80px per hour
  
  dayColumns: DayColumn[];       // ordered array (left to right)
  blocks: Record<string, GridBlock>;  // blockId -> GridBlock
  
  // Canvas view state
  zoom: number;                  // 0.3 to 2.0, default 1.0
  panX: number;                  // pixels
  panY: number;                  // pixels
  
  // History for undo/redo
  past: Omit<GridState, 'past' | 'future'>[];
  future: Omit<GridState, 'past' | 'future'>[];
  
  // Dirty flag
  isDirty: boolean;
  lastSavedAt: string | null;
}

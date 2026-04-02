import { create } from 'zustand';
import { GridState, DayColumn, TimeBlock } from '@/lib/grid-engine';
import { PX_PER_HOUR, timeDiffMinutes, addMinutesWrapped, timeToPixel } from '@/lib/time-utils';
import { v4 as uuidv4 } from 'uuid';

export type SnapInterval = 15 | 30 | 60;

type StateParams = Omit<GridState, 'past' | 'future'>;

interface GridStore extends GridState {
  currentSnapInterval: SnapInterval;
  activeTool: 'select' | 'pan';
  
  // Actions
  initGrid: (id: string, cols: DayColumn[], gridStartTime?: string, gridEndTime?: string) => void;
  setZoom: (zoom: number) => void;
  setPan: (x: number, y: number) => void;
  setActiveTool: (tool: 'select' | 'pan') => void;
  setSnapInterval: (snap: SnapInterval) => void;
  
  // History mechanics
  undo: () => void;
  redo: () => void;
  pushState: () => void; 
  
  // Block mutations
  addBlock: (partialBlock: Pick<TimeBlock, 'dayId' | 'startTime' | 'endTime'> & Partial<TimeBlock>) => void;
  updateBlock: (id: string, updates: Partial<TimeBlock>) => void;
  deleteBlock: (id: string) => void;
  duplicateBlock: (id: string, targetDayIds: string[]) => void;
  shiftBlock: (id: string, direction: 'up' | 'down') => void;
  
  // UI States (Modals, overlays)
  isBlockModalOpen: boolean;
  blockModalData: { dayId: string; startTime: string; endTime: string; blockId?: string } | null;
  openBlockModal: (dayId: string, startTime: string, endTime: string, blockId?: string) => void;
  closeBlockModal: () => void;
  
  isSkipModalOpen: boolean;
  skipModalBlockId: string | null;
  openSkipModal: (blockId: string) => void;
  closeSkipModal: () => void;
}

export const useGridStore = create<GridStore>((set, get) => ({
  id: '',
  gridStartTime: '07:00',
  gridEndTime: '23:00',
  pxPerHour: PX_PER_HOUR,
  dayColumns: [],
  blocks: {},
  zoom: 1.0,
  panX: 0,
  panY: 0,
  currentSnapInterval: 30,
  activeTool: 'select',
  isDirty: false,
  lastSavedAt: null,
  past: [],
  future: [],
  isBlockModalOpen: false,
  blockModalData: null,
  isSkipModalOpen: false,
  skipModalBlockId: null,

  initGrid: (id, cols, start = '07:00', end = '23:00') => set({
    id,
    dayColumns: cols,
    gridStartTime: start,
    gridEndTime: end,
    blocks: {},
    past: [],
    future: [],
    isDirty: false,
    zoom: 1.0,
    panX: 0,
    panY: 0,
    isBlockModalOpen: false,
    blockModalData: null,
    isSkipModalOpen: false,
    skipModalBlockId: null
  }),

  setSnapInterval: (snap) => set({ currentSnapInterval: snap }),
  setActiveTool: (activeTool) => set({ activeTool }),

  openBlockModal: (dayId, startTime, endTime, blockId) => set({ isBlockModalOpen: true, blockModalData: { dayId, startTime, endTime, blockId } }),
  closeBlockModal: () => set({ isBlockModalOpen: false, blockModalData: null }),
  
  openSkipModal: (blockId) => set({ isSkipModalOpen: true, skipModalBlockId: blockId }),
  closeSkipModal: () => set({ isSkipModalOpen: false, skipModalBlockId: null }),

  setZoom: (zoom) => set({ zoom }),
  setPan: (panX, panY) => set({ panX, panY }),
  
  pushState: () => {
    set((state) => {
      const currentState: StateParams = {
        id: state.id,
        gridStartTime: state.gridStartTime,
        gridEndTime: state.gridEndTime,
        pxPerHour: state.pxPerHour,
        dayColumns: [...state.dayColumns],
        blocks: { ...state.blocks },
        zoom: state.zoom,
        panX: state.panX,
        panY: state.panY,
        isDirty: state.isDirty,
        lastSavedAt: state.lastSavedAt
      };
      return {
        past: [...state.past, currentState].slice(-50),
        future: [],
        isDirty: true
      };
    });
  },

  undo: () => set((state) => {
    if (state.past.length === 0) return {};
    const previous = state.past[state.past.length - 1];
    return {
      ...previous,
      past: state.past.slice(0, -1),
      future: [
        {
          id: state.id,
          gridStartTime: state.gridStartTime,
          gridEndTime: state.gridEndTime,
          pxPerHour: state.pxPerHour,
          dayColumns: state.dayColumns,
          blocks: state.blocks,
          zoom: state.zoom,
          panX: state.panX,
          panY: state.panY,
          isDirty: state.isDirty,
          lastSavedAt: state.lastSavedAt
        },
        ...state.future
      ],
      isDirty: true
    };
  }),

  redo: () => set((state) => {
    if (state.future.length === 0) return {};
    const next = state.future[0];
    return {
      ...next,
      past: [
        ...state.past,
        {
          id: state.id,
          gridStartTime: state.gridStartTime,
          gridEndTime: state.gridEndTime,
          pxPerHour: state.pxPerHour,
          dayColumns: state.dayColumns,
          blocks: state.blocks,
          zoom: state.zoom,
          panX: state.panX,
          panY: state.panY,
          isDirty: state.isDirty,
          lastSavedAt: state.lastSavedAt
        }
      ],
      future: state.future.slice(1),
      isDirty: true
    };
  }),

  addBlock: (data) => {
    get().pushState();
    const id = `block_${uuidv4()}`;
    const newBlock: TimeBlock = {
      id,
      subject: data.subject || '',
      subjectType: data.subjectType || 'Revision',
      color: data.color || '#3b82f6',
      textColor: data.textColor || '#ffffff',
      priority: data.priority || null,
      notes: data.notes || '',
      sticker: data.sticker || null,
      status: data.status || 'pending',
      completedAt: null,
      skippedAt: null,
      skipReason: null,
      partialHours: null,
      isFixed: false,
      isRecurring: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data
    } as TimeBlock;

    // Expand grid bounds if block exceeds current end time
    const [gh, gm] = (get().gridEndTime).split(':').map(Number);
    const [bh, bm] = (data.endTime || '00:00').split(':').map(Number);
    const [sh, sm] = (get().gridStartTime).split(':').map(Number);
    
    let currentGridEndAbs = gh * 60 + gm;
    let blockEndAbs = bh * 60 + bm;
    const gridStartAbs = sh * 60 + sm;

    if (currentGridEndAbs <= gridStartAbs) currentGridEndAbs += 24 * 60;
    if (blockEndAbs <= gridStartAbs) blockEndAbs += 24 * 60;

    if (blockEndAbs > currentGridEndAbs) {
       set({ gridEndTime: data.endTime });
    }

    set((state) => ({
      blocks: { ...state.blocks, [id]: newBlock }
    }));
  },

  updateBlock: (id, updates) => {
    get().pushState();
    set((state) => {
      const block = state.blocks[id];
      if (!block) return {};
      
      const nextBlocks = {
        ...state.blocks,
        [id]: { ...block, ...updates, updatedAt: new Date().toISOString() }
      };

      // Expand bounds on update too
      if (updates.endTime) {
        const [gh, gm] = (state.gridEndTime).split(':').map(Number);
        const [bh, bm] = (updates.endTime).split(':').map(Number);
        const [sh, sm] = (state.gridStartTime).split(':').map(Number);
        
        let currentGridEndAbs = gh * 60 + gm;
        let blockEndAbs = bh * 60 + bm;
        const gridStartAbs = sh * 60 + sm;

        if (currentGridEndAbs <= gridStartAbs) currentGridEndAbs += 24 * 60;
        if (blockEndAbs <= gridStartAbs) blockEndAbs += 24 * 60;

        if (blockEndAbs > currentGridEndAbs) {
           return { blocks: nextBlocks, gridEndTime: updates.endTime };
        }
      }

      return { blocks: nextBlocks };
    });
  },

  deleteBlock: (id) => {
    get().pushState();
    set((state) => {
      const newBlocks = { ...state.blocks };
      delete newBlocks[id];
      return { blocks: newBlocks };
    });
  },

  duplicateBlock: (id, targetDayIds) => {
    const state = get();
    const sourceBlock = state.blocks[id];
    if (!sourceBlock || targetDayIds.length === 0) return;
    
    state.pushState();
    
    set((currState) => {
      const newBlocks = { ...currState.blocks };
      
      targetDayIds.forEach(dayId => {
        const newId = `block_${uuidv4()}`;
        newBlocks[newId] = {
           ...sourceBlock,
           id: newId,
           dayId: dayId,
           status: 'pending',
           completedAt: null,
           skippedAt: null,
           createdAt: new Date().toISOString(),
           updatedAt: new Date().toISOString(),
        };
      });
      
      return { blocks: newBlocks };
    });
  },

  shiftBlock: (id, direction) => {
    const state = get();
    const block = state.blocks[id];
    if (!block) return;
    
    state.pushState();
    
    const delta = direction === 'down' ? state.currentSnapInterval : -state.currentSnapInterval;
    
    const newStart = addMinutesWrapped(block.startTime, delta);
    const newEnd = addMinutesWrapped(block.endTime, delta);
    
    set((currState) => {
      const nextBlocks = {
        ...currState.blocks,
        [id]: { 
           ...block, 
           startTime: newStart, 
           endTime: newEnd, 
           updatedAt: new Date().toISOString() 
        }
      };
      
      let nextEndTime = currState.gridEndTime;
      
      // Auto-expand viewport vertically bounds if wrapping isn't enabled natively
      const [gh, gm] = (currState.gridEndTime).split(':').map(Number);
      const [bh, bm] = newEnd.split(':').map(Number);
      const [sh, sm] = (currState.gridStartTime).split(':').map(Number);
      
      let currentGridEndAbs = gh * 60 + gm;
      let blockEndAbs = bh * 60 + bm;
      const gridStartAbs = sh * 60 + sm;

      if (currentGridEndAbs <= gridStartAbs) currentGridEndAbs += 24 * 60;
      if (blockEndAbs <= gridStartAbs) blockEndAbs += 24 * 60;

      if (blockEndAbs > currentGridEndAbs) {
         nextEndTime = newEnd;
      }
      
      // Auto-Center logic: Update PanY to track the block natively!
      const blockYPos = timeToPixel(newStart, currState.gridStartTime, currState.pxPerHour);
      
      // We assume standard viewport Height ~ 800px. Ideally we want blockYPos to be ~100px from Top.
      // E.g., panY = window config height. But Zustand doesn't have window strictly safely.
      // A standard centered offset is about blockYPos - 200.
      let newPanY = currState.panY;
      
      // Only jump camera if it's currently out of ideal bound
      const maxViewportWindow = 600; 
      const currentRelativePos = blockYPos * currState.zoom + currState.panY;
      
      if (currentRelativePos < 50 || currentRelativePos > maxViewportWindow) {
         newPanY = -(blockYPos * currState.zoom - 100); 
         // clamp to zero if too high
         if (newPanY > 0) newPanY = 0;
      }

      return { 
        blocks: nextBlocks, 
        gridEndTime: nextEndTime,
        panY: newPanY
      };
    });
  }
}));

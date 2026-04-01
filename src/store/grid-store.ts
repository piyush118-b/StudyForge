import { create } from 'zustand';
import { GridState, DayColumn, TimeBlock } from '@/lib/grid-engine';
import { PX_PER_HOUR, timeDiffMinutes } from '@/lib/time-utils';
import { v4 as uuidv4 } from 'uuid';

export type SnapInterval = 15 | 30 | 60;

type StateParams = Omit<GridState, 'past' | 'future'>;

interface GridStore extends GridState {
  currentSnapInterval: SnapInterval;
  
  // Actions
  initGrid: (id: string, cols: DayColumn[], gridStartTime?: string, gridEndTime?: string) => void;
  setZoom: (zoom: number) => void;
  setPan: (x: number, y: number) => void;
  setSnapInterval: (snap: SnapInterval) => void;
  
  // History mechanics
  undo: () => void;
  redo: () => void;
  pushState: () => void; 
  
  // Block mutations
  addBlock: (partialBlock: Pick<TimeBlock, 'dayId' | 'startTime' | 'endTime'> & Partial<TimeBlock>) => void;
  updateBlock: (id: string, updates: Partial<TimeBlock>) => void;
  deleteBlock: (id: string) => void;
  
  // Advanced Grid structure
  addDayColumn: () => void;
  
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

    set((state) => ({
      blocks: { ...state.blocks, [id]: newBlock }
    }));
  },

  updateBlock: (id, updates) => {
    get().pushState();
    set((state) => {
      const block = state.blocks[id];
      if (!block) return {};
      return {
        blocks: {
          ...state.blocks,
          [id]: { ...block, ...updates, updatedAt: new Date().toISOString() }
        }
      };
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

  addDayColumn: () => {
    get().pushState();
    set((state) => {
      const newId = `col_custom_${Date.now()}`;
      const newCol: DayColumn = {
        id: newId,
        label: `Custom Day ${state.dayColumns.filter(c => c.isCustom).length + 1}`,
        isCustom: true,
        isHidden: false,
        widthPx: 160
      };
      return { dayColumns: [...state.dayColumns, newCol] };
    });
  }

}));

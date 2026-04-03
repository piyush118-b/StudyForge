import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface CreationState {
  subjects: Array<{ id: string, name: string, hours: number, color: string }>;
  goal: string;
  commitments: Record<string, any>;
  energyPeak: string;
  
  // Actions
  setGoal: (goal: string) => void;
  setEnergyPeak: (peak: string) => void;
  setSubjects: (subjects: any[]) => void;
  setCommitments: (commitments: any) => void;
  reset: () => void;
}

export const useCreationStore = create<CreationState>()(
  persist(
    (set) => ({
      subjects: [],
      goal: '',
      commitments: {},
      energyPeak: '',
      
      setGoal: (goal) => set({ goal }),
      setEnergyPeak: (energyPeak) => set({ energyPeak }),
      setSubjects: (subjects) => set({ subjects }),
      setCommitments: (commitments) => set({ commitments }),
      reset: () => set({ subjects: [], goal: '', commitments: {}, energyPeak: '' })
    }),
    {
      name: 'sf-creation',
      storage: createJSONStorage(() => sessionStorage)
    }
  )
)

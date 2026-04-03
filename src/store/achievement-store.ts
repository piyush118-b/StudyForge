import { create } from 'zustand';

interface AchievementState {
  recentAchievement: { title: string; description: string; emoji: string } | null;
  triggerAchievement: (title: string, description: string, emoji: string) => void;
  clearAchievement: () => void;
}

export const useAchievementStore = create<AchievementState>((set) => ({
  recentAchievement: null,
  triggerAchievement: (title, description, emoji) => set({ recentAchievement: { title, description, emoji } }),
  clearAchievement: () => set({ recentAchievement: null })
}));

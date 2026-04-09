import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  isBottomSheetOpen: boolean;
  setBottomSheetOpen: (open: boolean) => void;
  toggleBottomSheet: () => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isBottomSheetOpen: false,
      setBottomSheetOpen: (open) => set({ isBottomSheetOpen: open }),
      toggleBottomSheet: () => set((state) => ({ isBottomSheetOpen: !state.isBottomSheetOpen })),
      theme: 'light',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'mintech-theme-storage',
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);

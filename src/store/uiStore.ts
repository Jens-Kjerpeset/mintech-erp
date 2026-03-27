import { create } from 'zustand';

interface UIState {
 isTransactionSheetOpen: boolean;
 setTransactionSheetOpen: (open: boolean) => void;
 // We can add more UI orchestration state here as needed
}

export const useUIStore = create<UIState>((set) => ({
 isTransactionSheetOpen: false,
 setTransactionSheetOpen: (open) => set({ isTransactionSheetOpen: open }),
}));

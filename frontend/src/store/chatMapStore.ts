import { create } from 'zustand';

interface ChatMapState {
    targetClinic: string | null;
    setTargetClinic: (name: string) => void;
}

export const useChatMapStore = create<ChatMapState>((set) => ({
    targetClinic: null,
    setTargetClinic: (name) => set({ targetClinic: name }),
}));

import { create } from "zustand";

type JoinSquadModalStore = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

export const useJoinSquadModalStore = create<JoinSquadModalStore>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));

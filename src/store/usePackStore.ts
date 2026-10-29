import { create } from "zustand";
import { persist } from "zustand/middleware";
import { drawPack } from "@/lib/gacha";
import type { PackPhase, PulledCard } from "@/types/card";

interface PackState {
  phase: PackPhase;
  cards: PulledCard[];
  flipped: Record<string, boolean>;
  /** 카드 번호 → 보유 장수 */
  collection: Record<string, number>;
  packsOpened: number;

  tearPack: () => void;
  setPhase: (phase: PackPhase) => void;
  flipCard: (uid: string) => void;
  flipAll: () => void;
  reset: () => void;
}

export const usePackStore = create<PackState>()(
  persist(
    (set, get) => ({
      phase: "idle",
      cards: [],
      flipped: {},
      collection: {},
      packsOpened: 0,

      tearPack: () => {
        if (get().phase !== "idle") return;
        const cards = drawPack();
        const collection = { ...get().collection };
        for (const c of cards) collection[c.id] = (collection[c.id] ?? 0) + 1;
        set({
          phase: "tearing",
          cards,
          flipped: {},
          collection,
          packsOpened: get().packsOpened + 1,
        });
      },

      setPhase: (phase) => set({ phase }),

      flipCard: (uid) => set((s) => ({ flipped: { ...s.flipped, [uid]: true } })),

      flipAll: () =>
        set((s) => ({ flipped: Object.fromEntries(s.cards.map((c) => [c.uid, true])) })),

      reset: () => set({ phase: "idle", cards: [], flipped: {} }),
    }),
    {
      name: "gatta-collection-m6",
      skipHydration: true,
      // 진행 중인 개봉 상태는 저장하지 않고 도감만 유지
      partialize: (s) => ({ collection: s.collection, packsOpened: s.packsOpened }),
    },
  ),
);

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { BOX_PRICE, PACK_PRICE } from "@/data/rates";
import { drawBox, drawPack } from "@/lib/gacha";
import type { PackPhase, PulledCard } from "@/types/card";

interface PackState {
  phase: PackPhase;
  /** 구매했지만 아직 안 뜯은 팩 (구매 시점에 미리 뽑아 둠 — 박스 확정 구성 유지) */
  unopened: PulledCard[][];
  /** 지금 뜯은 팩의 카드 (레어도 오름차순) */
  cards: PulledCard[];
  /** 카드 더미에서 맨 위 카드의 인덱스 */
  top: number;
  /** 카드 번호 → 보유 장수 */
  collection: Record<string, number>;
  packsOpened: number;
  /** 누적 구매 금액 (원) */
  spent: number;

  buy: (boxes: number, packs: number) => void;
  tearPack: () => void;
  setPhase: (phase: PackPhase) => void;
  /** 맨 위 카드를 넘김 */
  swipe: () => void;
  /** 남은 카드 한 번에 넘기기 */
  skipAll: () => void;
  /** 한 팩을 다 본 뒤: 남은 팩이 있으면 다음 팩, 없으면 상점 */
  next: () => void;
  goShop: () => void;
}

export const usePackStore = create<PackState>()(
  persist(
    (set, get) => ({
      phase: "shop",
      unopened: [],
      cards: [],
      top: 0,
      collection: {},
      packsOpened: 0,
      spent: 0,

      buy: (boxes, packs) => {
        if (boxes + packs <= 0) return;
        const bought = [
          ...Array.from({ length: boxes }, drawBox).flat(),
          ...Array.from({ length: packs }, () => drawPack()),
        ];
        set((s) => ({
          unopened: [...s.unopened, ...bought],
          spent: s.spent + boxes * BOX_PRICE + packs * PACK_PRICE,
          phase: "idle",
        }));
      },

      tearPack: () => {
        const { phase, unopened, collection, packsOpened } = get();
        if (phase !== "idle" || unopened.length === 0) return;
        const [cards, ...rest] = unopened;
        const next = { ...collection };
        for (const c of cards) next[c.id] = (next[c.id] ?? 0) + 1;
        set({
          phase: "tearing",
          unopened: rest,
          cards,
          top: 0,
          collection: next,
          packsOpened: packsOpened + 1,
        });
      },

      setPhase: (phase) => set({ phase }),

      swipe: () =>
        set((s) => (s.top + 1 >= s.cards.length ? { top: s.cards.length, phase: "done" } : { top: s.top + 1 })),

      skipAll: () => set((s) => ({ top: s.cards.length, phase: "done" })),

      next: () => set((s) => ({ phase: s.unopened.length > 0 ? "idle" : "shop", cards: [], top: 0 })),

      goShop: () => set({ phase: "shop", cards: [], top: 0 }),
    }),
    {
      name: "gatta-collection-m6",
      skipHydration: true,
      // 진행 중인 개봉 상태는 저장하지 않고 도감·지출·남은 팩만 유지
      partialize: (s) => ({
        collection: s.collection,
        packsOpened: s.packsOpened,
        spent: s.spent,
        unopened: s.unopened,
      }),
      // 남은 팩이 있으면 상점 대신 바로 뜯기 화면
      onRehydrateStorage: () => (s) => {
        if (s && s.unopened.length > 0) s.setPhase("idle");
      },
    },
  ),
);

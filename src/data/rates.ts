import type { Rarity } from "@/types/card";

/**
 * 팩 구성 및 레어도 확률 — 공식 발표가 아닌 비공식 추정치.
 * 포켓몬컴퍼니는 확률을 공개하지 않으며, 아래 값은 판매점/커뮤니티 개봉 샘플
 * (Samurai Sword, TCGTalk 등)을 참고해 30팩 1박스 기준 기대 장수로 잡은 것.
 * RR 은 참고할 수치가 없어 임의로 정함.
 */

/** 앞 슬롯: 고정 레어도 */
export const FIXED_SLOTS: Rarity[] = ["C", "C", "C", "U"];

const PACKS_PER_BOX = 30;

/** 마지막(레어) 슬롯의 박스당 기대 장수. 나머지는 R 로 채움 */
const HIT_PER_BOX: Partial<Record<Rarity, number>> = {
  MUR: 0.05,
  SAR: 0.35,
  SR: 1,
  AR: 2.5,
  RR: 4,
};

/** 레어 슬롯의 레어도별 확률 (합 1) */
export const HIT_SLOT_RATES: Partial<Record<Rarity, number>> = (() => {
  const rates: Partial<Record<Rarity, number>> = {};
  let rest = 1;
  for (const [r, perBox] of Object.entries(HIT_PER_BOX)) {
    rates[r as Rarity] = perBox / PACKS_PER_BOX;
    rest -= perBox / PACKS_PER_BOX;
  }
  rates.R = rest;
  return rates;
})();

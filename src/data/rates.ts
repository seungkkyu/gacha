import type { Rarity } from "@/types/card";

/**
 * 가격·팩 구성·레어도 확률.
 * 가격은 한글판 정가. 확률과 박스 확정 구성은 공식 발표가 없어 판매점/커뮤니티
 * 개봉 샘플(Samurai Sword, TCGTalk 등)을 참고한 비공식 추정치이며, RR 장수는 임의로 정함.
 */

export const PACK_PRICE = 1_500;
export const BOX_PRICE = 45_000;
export const PACKS_PER_BOX = 30;

/** 앞 슬롯: 고정 레어도. 마지막 1장은 레어 슬롯 (R 이상) */
export const FIXED_SLOTS: Rarity[] = ["C", "C", "C", "U"];

/** 박스 1개(30팩)의 레어 슬롯 중 확정 장수. 나머지는 SR 이상 1장 + R */
export const BOX_FIXED: Partial<Record<Rarity, number>> = { RR: 4, AR: 2 };

/** 박스마다 1장 확정인 SR 이상 슬롯의 레어도 확률 (합 1) */
export const SR_PLUS_RATES: Partial<Record<Rarity, number>> = { SR: 0.7, SAR: 0.285, MUR: 0.015 };

/** 낱팩 레어 슬롯 확률: 박스 기대 장수를 팩 수로 나눈 값, 나머지는 R */
export const HIT_SLOT_RATES: Partial<Record<Rarity, number>> = (() => {
  const perBox: Partial<Record<Rarity, number>> = { ...BOX_FIXED, ...SR_PLUS_RATES };
  const rates: Partial<Record<Rarity, number>> = {};
  let rest = 1;
  for (const [r, n] of Object.entries(perBox)) {
    rates[r as Rarity] = n / PACKS_PER_BOX;
    rest -= n / PACKS_PER_BOX;
  }
  rates.R = rest;
  return rates;
})();

/** 박스 b개 + 낱팩 n개를 샀을 때 rarities 중 하나라도 1장 이상 나올 확률 */
export function chanceAtLeastOne(rarities: Rarity[], boxes: number, packs: number): number {
  const sum = (rates: Partial<Record<Rarity, number>>) => rarities.reduce((s, r) => s + (rates[r] ?? 0), 0);
  const boxMiss = rarities.some((r) => (BOX_FIXED[r] ?? 0) > 0) ? 0 : 1 - sum(SR_PLUS_RATES);
  return 1 - boxMiss ** boxes * (1 - sum(HIT_SLOT_RATES)) ** packs;
}

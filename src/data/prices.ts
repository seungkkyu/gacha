import type { Rarity } from "@/types/card";
import { CARDS, CARDS_BY_RARITY } from "./cards";
import { FIXED_SLOTS, HIT_SLOT_RATES } from "./rates";

/**
 * 한글판 싱글 시세 (원). 한글판은 공개 시세 데이터가 거의 없어서:
 *  - 확인된 카드: KREAM 한글판 체결가
 *  - 나머지: 일본판 매입가(엔) × 환산 비율로 추정. 비율은 양쪽 시세가 다 있는
 *    메가레쿠쟈 ex SAR(한글판 90,000원 / 일본판 매입 ¥17,500)에서 구함
 *  - C/U/R 은 사실상 0원으로 봄
 * 저가 카드는 추정이 크게 빗나갈 수 있음 (예: 가이오가 AR 은 추정 약 1,500원, 실거래 20,000원).
 */
export const PRICE_DATE = "2026-10-29";

const KR_PER_JP = 90_000 / 17_500;

/** 일본판 매입가 (엔) — トレカの地図 2026-10-29 기준 */
const JP_BUYBACK: Record<string, number> = {
  // RR
  "009": 10, "015": 10, "021": 10, "024": 10, "033": 10, "048": 10, "058": 40, "062": 70,
  // AR
  "077": 90, "078": 130, "079": 90, "080": 300, "081": 90, "082": 90,
  "083": 90, "084": 300, "085": 90, "086": 90, "087": 100, "088": 250,
  // SR
  "089": 150, "090": 150, "091": 100, "092": 130, "093": 130, "094": 130, "095": 1_350, "096": 300,
  "097": 40, "098": 30, "099": 50, "100": 150, "101": 100, "102": 130, "103": 430,
  "104": 30, "105": 30, "106": 30,
  // SAR / MUR
  "107": 500, "108": 3_100, "109": 500, "110": 17_500, "111": 250, "112": 1_250,
  "113": 42_500,
};

/** 한글판 실거래가 (원) — KREAM */
const KR_PRICE: Record<string, number> = {
  "110": 90_000, // 메가레쿠쟈 ex SAR, 2026-10-25 체결
  "080": 20_000, // 가이오가 AR
};

export interface Price {
  won: number;
  /** kr: 한글판 실거래, estimate: 일본판 매입가 환산 추정 */
  source: "kr" | "estimate";
}

export const PRICES: Record<string, Price> = Object.fromEntries(
  CARDS.map((c) => {
    if (KR_PRICE[c.id]) return [c.id, { won: KR_PRICE[c.id], source: "kr" }];
    const jp = JP_BUYBACK[c.id] ?? 0;
    return [c.id, { won: Math.round((jp * KR_PER_JP) / 100) * 100, source: "estimate" }];
  }),
);

export const priceOf = (id: string) => PRICES[id]?.won ?? 0;

/** 레어도 안에서 균등하게 뽑힐 때 한 장의 평균 가치 */
export const avgPriceOf = (rarity: Rarity) => {
  const cards = CARDS_BY_RARITY[rarity];
  return cards.reduce((s, c) => s + priceOf(c.id), 0) / cards.length;
};

/** 보유 카드 총 가치 */
export const collectionValue = (collection: Record<string, number>) =>
  Object.entries(collection).reduce((s, [id, n]) => s + priceOf(id) * n, 0);

/** 팩 1개의 기대 가치. 박스도 레어도별 기대 장수가 같아 박스 = 이 값 × 30 */
export const expectedPackValue = () =>
  FIXED_SLOTS.reduce((s, r) => s + avgPriceOf(r), 0) +
  Object.entries(HIT_SLOT_RATES).reduce((s, [r, p]) => s + p * avgPriceOf(r as Rarity), 0);

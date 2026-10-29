/** 공식 레어도 표기 (M6.json 의 rarity 값) */
export type Rarity = "C" | "U" | "R" | "RR" | "AR" | "SR" | "SAR" | "MUR";

/** 연출 강도 단계. 레어도 여러 개가 같은 연출을 공유함 */
export type Tier = "common" | "uncommon" | "rare" | "ultra" | "legendary";

export interface Card {
  /** 세트 내 번호 ("001") */
  id: string;
  name: string;
  rarity: Rarity;
  tier: Tier;
  /** public 기준 이미지 경로 */
  image: string;
}

/** 팩에서 뽑힌 카드 한 장 (같은 카드가 여러 장 나올 수 있어 uid 로 구분) */
export interface PulledCard extends Card {
  uid: string;
}

export type PackPhase = "idle" | "tearing" | "opening" | "revealed";

import type { Card, Rarity, Tier } from "@/types/card";
import M6 from "./cards/M6.json";

export const SET_NAME = M6.setName;

/** 낮은 레어도 → 높은 레어도 순 */
export const RARITY_ORDER: Rarity[] = ["C", "U", "R", "RR", "AR", "SR", "SAR", "MUR"];

export const RARITY_TIER: Record<Rarity, Tier> = {
  C: "common",
  U: "uncommon",
  R: "rare",
  RR: "rare",
  AR: "ultra",
  SR: "ultra",
  SAR: "legendary",
  MUR: "legendary",
};

export const CARDS: Card[] = M6.cards.map((c) => {
  const rarity = c.rarity as Rarity;
  return {
    id: c.number.split("/")[0],
    name: c.name,
    rarity,
    tier: RARITY_TIER[rarity],
    image: c.image,
  };
});

export const CARDS_BY_RARITY = Object.fromEntries(
  RARITY_ORDER.map((r) => [r, CARDS.filter((c) => c.rarity === r)]),
) as Record<Rarity, Card[]>;

export const PACK_IMAGE = `/cards/${M6.setCode}/pack.webp`;

/** 카드 뒷면. 저작권 때문에 저장소에 없으며 직접 넣어야 함 (없으면 그려 둔 뒷면으로 대체) */
export const CARD_BACK = "/cards/back.webp";

import { CARDS_BY_RARITY, RARITY_ORDER } from "@/data/cards";
import { FIXED_SLOTS, HIT_SLOT_RATES } from "@/data/rates";
import type { PulledCard, Rarity, Tier } from "@/types/card";

export const CARDS_PER_PACK = FIXED_SLOTS.length + 1;

function rollHitRarity(): Rarity {
  let roll = Math.random();
  for (const [r, rate] of Object.entries(HIT_SLOT_RATES)) {
    roll -= rate;
    if (roll <= 0) return r as Rarity;
  }
  return "R";
}

/** 같은 레어도 안에서는 균등 확률 */
function pickByRarity(rarity: Rarity): PulledCard {
  const candidates = CARDS_BY_RARITY[rarity];
  const card = candidates[Math.floor(Math.random() * candidates.length)];
  return { ...card, uid: `${card.id}-${crypto.randomUUID()}` };
}

/** 한 팩 뽑기. 마지막 장은 R 이상 확정, 레어도 오름차순으로 정렬해 마지막에 하이라이트 */
export function drawPack(): PulledCard[] {
  const cards = [...FIXED_SLOTS, rollHitRarity()].map(pickByRarity);
  return cards.sort((a, b) => RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity));
}

const TIER_ORDER: Tier[] = ["common", "uncommon", "rare", "ultra", "legendary"];

export const isShiny = (tier: Tier) => TIER_ORDER.indexOf(tier) >= TIER_ORDER.indexOf("rare");

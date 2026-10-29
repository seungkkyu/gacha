import { CARDS_BY_RARITY, RARITY_ORDER } from "@/data/cards";
import { BOX_FIXED, FIXED_SLOTS, HIT_SLOT_RATES, PACKS_PER_BOX, SR_PLUS_RATES } from "@/data/rates";
import type { PulledCard, Rarity, Tier } from "@/types/card";

export const CARDS_PER_PACK = FIXED_SLOTS.length + 1;

function roll(rates: Partial<Record<Rarity, number>>, fallback: Rarity): Rarity {
  let r = Math.random();
  for (const [rarity, rate] of Object.entries(rates)) {
    r -= rate;
    if (r <= 0) return rarity as Rarity;
  }
  return fallback;
}

/** 같은 레어도 안에서는 균등 확률 */
function pickByRarity(rarity: Rarity): PulledCard {
  const candidates = CARDS_BY_RARITY[rarity];
  const card = candidates[Math.floor(Math.random() * candidates.length)];
  return { ...card, uid: `${card.id}-${crypto.randomUUID()}` };
}

/** 한 팩 뽑기. 레어 슬롯을 정하지 않으면 낱팩 확률로 굴림. 레어도 오름차순 (마지막이 최고) */
export function drawPack(hit: Rarity = roll(HIT_SLOT_RATES, "R")): PulledCard[] {
  const cards = [...FIXED_SLOTS, hit].map(pickByRarity);
  return cards.sort((a, b) => RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity));
}

/** 한 박스(30팩) 뽑기. 확정 레어 슬롯을 섞어 각 팩에 배분 */
export function drawBox(): PulledCard[][] {
  const hits: Rarity[] = [roll(SR_PLUS_RATES, "SR")];
  for (const [r, n] of Object.entries(BOX_FIXED)) hits.push(...Array<Rarity>(n).fill(r as Rarity));
  while (hits.length < PACKS_PER_BOX) hits.push("R");
  for (let i = hits.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [hits[i], hits[j]] = [hits[j], hits[i]];
  }
  return hits.map((h) => drawPack(h));
}

const TIER_ORDER: Tier[] = ["common", "uncommon", "rare", "ultra", "legendary"];

export const isShiny = (tier: Tier) => TIER_ORDER.indexOf(tier) >= TIER_ORDER.indexOf("rare");

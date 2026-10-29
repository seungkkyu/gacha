import { POKEMON, RARITY_WEIGHT } from "@/data/pokemon";
import type { PulledCard, Rarity } from "@/types/pokemon";

export const CARDS_PER_PACK = 5;

const RARITY_ORDER: Rarity[] = ["common", "uncommon", "rare", "ultra", "legendary"];

function rollRarity(minRarity: Rarity = "common"): Rarity {
  const pool = RARITY_ORDER.slice(RARITY_ORDER.indexOf(minRarity));
  const total = pool.reduce((sum, r) => sum + RARITY_WEIGHT[r], 0);
  let roll = Math.random() * total;
  for (const r of pool) {
    roll -= RARITY_WEIGHT[r];
    if (roll <= 0) return r;
  }
  return pool[pool.length - 1];
}

function pickByRarity(rarity: Rarity): PulledCard {
  const candidates = POKEMON.filter((p) => p.rarity === rarity);
  const pokemon = candidates[Math.floor(Math.random() * candidates.length)];
  return { ...pokemon, uid: `${pokemon.id}-${crypto.randomUUID()}` };
}

/** 한 팩 뽑기. 마지막 장은 레어 이상 확정, 레어도 오름차순으로 정렬해 마지막에 하이라이트 */
export function drawPack(): PulledCard[] {
  const cards = Array.from({ length: CARDS_PER_PACK - 1 }, () => pickByRarity(rollRarity()));
  cards.push(pickByRarity(rollRarity("rare")));
  return cards.sort((a, b) => RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity));
}

export const isShiny = (rarity: Rarity) => RARITY_ORDER.indexOf(rarity) >= RARITY_ORDER.indexOf("rare");

export type PokemonType =
  | "normal"
  | "fire"
  | "water"
  | "grass"
  | "electric"
  | "ice"
  | "fighting"
  | "poison"
  | "ground"
  | "rock"
  | "bug"
  | "ghost"
  | "psychic"
  | "dragon"
  | "fairy";

export type Rarity = "common" | "uncommon" | "rare" | "ultra" | "legendary";

export interface Pokemon {
  id: number;
  name: string;
  type: PokemonType;
  hp: number;
  rarity: Rarity;
}

/** 팩에서 뽑힌 카드 한 장 (같은 포켓몬이 여러 장 나올 수 있어 uid 로 구분) */
export interface PulledCard extends Pokemon {
  uid: string;
}

export type PackPhase = "idle" | "tearing" | "opening" | "revealed";

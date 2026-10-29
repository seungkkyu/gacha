import type { Pokemon, PokemonType, Rarity } from "@/types/pokemon";

export const POKEMON: Pokemon[] = [
  // common
  { id: 1, name: "이상해씨", type: "grass", hp: 60, rarity: "common" },
  { id: 4, name: "파이리", type: "fire", hp: 60, rarity: "common" },
  { id: 7, name: "꼬부기", type: "water", hp: 60, rarity: "common" },
  { id: 10, name: "캐터피", type: "bug", hp: 40, rarity: "common" },
  { id: 16, name: "구구", type: "normal", hp: 50, rarity: "common" },
  { id: 19, name: "꼬렛", type: "normal", hp: 40, rarity: "common" },
  { id: 23, name: "아보", type: "poison", hp: 60, rarity: "common" },
  { id: 27, name: "모래두지", type: "ground", hp: 60, rarity: "common" },
  { id: 35, name: "삐삐", type: "fairy", hp: 60, rarity: "common" },
  { id: 39, name: "푸린", type: "fairy", hp: 60, rarity: "common" },
  { id: 41, name: "주뱃", type: "poison", hp: 50, rarity: "common" },
  { id: 43, name: "뚜벅쵸", type: "grass", hp: 50, rarity: "common" },
  { id: 50, name: "디그다", type: "ground", hp: 40, rarity: "common" },
  { id: 52, name: "나옹", type: "normal", hp: 60, rarity: "common" },
  { id: 54, name: "고라파덕", type: "water", hp: 70, rarity: "common" },
  { id: 58, name: "가디", type: "fire", hp: 70, rarity: "common" },
  { id: 60, name: "발챙이", type: "water", hp: 50, rarity: "common" },
  { id: 63, name: "캐이시", type: "psychic", hp: 40, rarity: "common" },
  { id: 66, name: "알통몬", type: "fighting", hp: 70, rarity: "common" },
  { id: 74, name: "꼬마돌", type: "rock", hp: 70, rarity: "common" },
  { id: 81, name: "코일", type: "electric", hp: 50, rarity: "common" },
  { id: 92, name: "고오스", type: "ghost", hp: 50, rarity: "common" },
  { id: 129, name: "잉어킹", type: "water", hp: 30, rarity: "common" },
  // uncommon
  { id: 2, name: "이상해풀", type: "grass", hp: 90, rarity: "uncommon" },
  { id: 5, name: "리자드", type: "fire", hp: 90, rarity: "uncommon" },
  { id: 8, name: "어니부기", type: "water", hp: 90, rarity: "uncommon" },
  { id: 26, name: "라이츄", type: "electric", hp: 100, rarity: "uncommon" },
  { id: 37, name: "식스테일", type: "fire", hp: 70, rarity: "uncommon" },
  { id: 59, name: "윈디", type: "fire", hp: 130, rarity: "uncommon" },
  { id: 94, name: "팬텀", type: "ghost", hp: 120, rarity: "uncommon" },
  { id: 95, name: "롱스톤", type: "rock", hp: 110, rarity: "uncommon" },
  { id: 133, name: "이브이", type: "normal", hp: 60, rarity: "uncommon" },
  // rare
  { id: 25, name: "피카츄", type: "electric", hp: 70, rarity: "rare" },
  { id: 3, name: "이상해꽃", type: "grass", hp: 160, rarity: "rare" },
  { id: 6, name: "리자몽", type: "fire", hp: 170, rarity: "rare" },
  { id: 9, name: "거북왕", type: "water", hp: 160, rarity: "rare" },
  { id: 130, name: "갸라도스", type: "water", hp: 150, rarity: "rare" },
  { id: 131, name: "라프라스", type: "ice", hp: 130, rarity: "rare" },
  { id: 143, name: "잠만보", type: "normal", hp: 160, rarity: "rare" },
  { id: 149, name: "망나뇽", type: "dragon", hp: 160, rarity: "rare" },
  // ultra
  { id: 144, name: "프리져", type: "ice", hp: 180, rarity: "ultra" },
  { id: 145, name: "썬더", type: "electric", hp: 180, rarity: "ultra" },
  { id: 146, name: "파이어", type: "fire", hp: 180, rarity: "ultra" },
  { id: 150, name: "뮤츠", type: "psychic", hp: 200, rarity: "ultra" },
  // legendary
  { id: 151, name: "뮤", type: "psychic", hp: 120, rarity: "legendary" },
  { id: 249, name: "루기아", type: "psychic", hp: 220, rarity: "legendary" },
  { id: 250, name: "칠색조", type: "fire", hp: 220, rarity: "legendary" },
  { id: 384, name: "레쿠쟈", type: "dragon", hp: 230, rarity: "legendary" },
];

export const artworkUrl = (id: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

export const RARITY_WEIGHT: Record<Rarity, number> = {
  common: 62,
  uncommon: 24,
  rare: 10,
  ultra: 3.2,
  legendary: 0.8,
};

export const RARITY_LABEL: Record<Rarity, { label: string; stars: number }> = {
  common: { label: "COMMON", stars: 1 },
  uncommon: { label: "UNCOMMON", stars: 2 },
  rare: { label: "RARE", stars: 3 },
  ultra: { label: "ULTRA RARE", stars: 4 },
  legendary: { label: "LEGENDARY", stars: 5 },
};

/** 카드 프레임 색: [밝은 색, 진한 색] */
export const TYPE_COLOR: Record<PokemonType, { from: string; to: string; label: string }> = {
  normal: { from: "#e7e2d1", to: "#a8a77a", label: "노말" },
  fire: { from: "#ffb067", to: "#e2502c", label: "불꽃" },
  water: { from: "#9fd3ff", to: "#3d7fe0", label: "물" },
  grass: { from: "#b9eb8a", to: "#4f9e3a", label: "풀" },
  electric: { from: "#fff27a", to: "#e8b311", label: "전기" },
  ice: { from: "#d6f6ff", to: "#6fc6dc", label: "얼음" },
  fighting: { from: "#f3a483", to: "#b23a2b", label: "격투" },
  poison: { from: "#dba6f0", to: "#8c3fa5", label: "독" },
  ground: { from: "#f0d79a", to: "#b48a3b", label: "땅" },
  rock: { from: "#dccf98", to: "#9a8838", label: "바위" },
  bug: { from: "#d6e97a", to: "#8a9b1c", label: "벌레" },
  ghost: { from: "#b6a6e0", to: "#5a4698", label: "고스트" },
  psychic: { from: "#ffadc8", to: "#e2487a", label: "에스퍼" },
  dragon: { from: "#b3a2ff", to: "#5a37d8", label: "드래곤" },
  fairy: { from: "#ffd0ea", to: "#d77aae", label: "페어리" },
};

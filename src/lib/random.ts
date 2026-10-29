/** 렌더 중에 써도 되는 결정적 의사난수 (0~1). 같은 seed 면 항상 같은 값 */
export function seeded(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

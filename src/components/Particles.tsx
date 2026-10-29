import { seeded } from "@/lib/random";

interface Props {
  count?: number;
  colors: string[];
  distance?: number;
  seed?: number;
}

/** 중심에서 사방으로 터지는 파티클 */
export default function Particles({ count = 28, colors, distance = 180, seed = 1 }: Props) {
  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      {Array.from({ length: count }, (_, i) => {
        const r1 = seeded(seed * 100 + i);
        const r2 = seeded(seed * 200 + i);
        const angle = (i / count) * Math.PI * 2 + r1 * 0.6;
        const dist = distance * (0.5 + r2 * 0.7);
        const size = 4 + r1 * 7;
        return (
          <span
            key={i}
            className="particle"
            style={
              {
                width: size,
                height: size,
                background: colors[i % colors.length],
                boxShadow: `0 0 ${size * 2}px ${colors[i % colors.length]}`,
                "--dx": `${Math.cos(angle) * dist}px`,
                "--dy": `${Math.sin(angle) * dist}px`,
                "--p-delay": `${r2 * 0.15}s`,
              } as React.CSSProperties
            }
          />
        );
      })}
    </div>
  );
}

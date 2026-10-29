import Image from "next/image";
import { artworkUrl, POKEMON } from "@/data/pokemon";

interface Props {
  collection: Record<number, number>;
}

export default function Collection({ collection }: Props) {
  return (
    <section className="relative z-10 w-full max-w-5xl px-4 pb-12 sm:px-6">
      <h2 className="mb-3 text-sm font-bold tracking-widest text-white/60">도감</h2>
      <div className="grid grid-cols-6 gap-2 sm:grid-cols-10 md:grid-cols-12">
        {POKEMON.map((p) => {
          const count = collection[p.id] ?? 0;
          return (
            <div
              key={p.id}
              title={count ? `${p.name} ×${count}` : "???"}
              className={`relative aspect-square rounded-lg border ${
                count ? "border-white/20 bg-white/10" : "border-white/5 bg-white/[0.03]"
              }`}
            >
              <Image
                src={artworkUrl(p.id)}
                alt={count ? p.name : "미발견"}
                fill
                sizes="64px"
                className={`object-contain p-1 transition ${count ? "" : "brightness-0 opacity-30"}`}
              />
              {count > 1 && (
                <span className="absolute bottom-0.5 right-1 text-[9px] font-bold text-yellow-300">×{count}</span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

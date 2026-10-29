import Image from "next/image";
import { CARDS } from "@/data/cards";

interface Props {
  collection: Record<string, number>;
}

export default function Collection({ collection }: Props) {
  return (
    <section className="relative z-10 w-full max-w-5xl px-4 pb-12 sm:px-6">
      <h2 className="mb-3 text-sm font-bold tracking-widest text-white/60">도감</h2>
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 md:grid-cols-11">
        {CARDS.map((c) => {
          const count = collection[c.id] ?? 0;
          return (
            <div
              key={c.id}
              title={count ? `${c.name} (${c.rarity}) ×${count}` : `${c.id} ???`}
              className={`relative aspect-[5/7] overflow-hidden rounded-md border ${
                count ? "border-white/20 bg-white/10" : "border-white/5 bg-white/[0.03]"
              }`}
            >
              <Image
                src={c.image}
                alt={count ? c.name : "미발견"}
                fill
                sizes="90px"
                className={`object-cover transition ${count ? "" : "brightness-0 opacity-30"}`}
              />
              {count > 1 && (
                <span className="absolute bottom-0.5 right-1 rounded bg-black/60 px-1 text-[9px] font-bold text-yellow-300">
                  ×{count}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

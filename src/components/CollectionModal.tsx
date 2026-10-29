"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { CARDS, RARITY_ORDER } from "@/data/cards";
import { PRICES, collectionValue } from "@/data/prices";
import type { Card, Rarity } from "@/types/card";
import { won } from "./Shop";

interface Props {
  collection: Record<string, number>;
  onClose: () => void;
}

/** 카드 한 장 크게 보기 */
export function CardLightbox({ card, count, onClose }: { card: Card; count?: number; onClose: () => void }) {
  return (
    <div
      className="fade-in fixed inset-0 z-[60] flex flex-col items-center justify-center gap-4 bg-black/85 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="zoom-in relative aspect-[5/7] h-[min(78vh,140vw)]">
        <Image src={card.image} alt={card.name} fill sizes="560px" className="rounded-[18px] object-contain" />
      </div>
      <p className="text-sm text-white/80">
        {card.id} · {card.name} · <b className="text-yellow-300">{card.rarity}</b>
        {count ? ` · ${count}장 보유` : ""}
      </p>
      <p className="-mt-2 text-xs text-white/60">
        {PRICES[card.id].won > 0
          ? `시세 ${won(PRICES[card.id].won)} (${PRICES[card.id].source === "kr" ? "한글판 실거래" : "추정"})`
          : "시세 거의 없음"}
      </p>
    </div>
  );
}

export default function CollectionModal({ collection, onClose }: Props) {
  const [zoom, setZoom] = useState<Card | null>(null);
  const [filter, setFilter] = useState<Rarity | "ALL">("ALL");

  // ESC: 확대 보기 → 도감 순서로 닫기
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (zoom) setZoom(null);
      else onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoom, onClose]);

  const owned = CARDS.filter((c) => collection[c.id]).length;
  const shown = filter === "ALL" ? CARDS : CARDS.filter((c) => c.rarity === filter);

  return (
    <div className="fade-in fixed inset-0 z-50 flex justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="m-3 flex w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#120e26]/95 sm:m-6"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-6">
          <h2 className="text-base font-bold">
            도감 <span className="text-sm font-semibold text-white/60">{owned} / {CARDS.length}</span>
            <span className="ml-3 text-sm font-semibold text-yellow-300">{won(collectionValue(collection))}</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="rounded-full px-3 py-1 text-lg text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            ✕
          </button>
        </header>

        <div className="flex gap-1.5 overflow-x-auto px-4 py-3 sm:px-6">
          {(["ALL", ...RARITY_ORDER] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setFilter(r)}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition ${
                filter === r ? "bg-yellow-300 text-[#2a1200]" : "bg-white/10 text-white/70 hover:bg-white/20"
              }`}
            >
              {r === "ALL" ? "전체" : r}
            </button>
          ))}
        </div>

        <div className="grid flex-1 grid-cols-4 content-start gap-2 overflow-y-auto px-4 pb-6 sm:grid-cols-6 sm:px-6 md:grid-cols-8">
          {shown.map((c) => {
            const count = collection[c.id] ?? 0;
            return (
              <button
                key={c.id}
                type="button"
                disabled={!count}
                onClick={() => setZoom(c)}
                title={count ? `${c.name} (${c.rarity}) ×${count}` : `${c.id} ???`}
                className={`relative aspect-[5/7] overflow-hidden rounded-md border transition ${
                  count
                    ? "cursor-zoom-in border-white/20 bg-white/10 hover:scale-105 hover:border-yellow-300/70"
                    : "border-white/5 bg-white/[0.03]"
                }`}
              >
                <Image
                  src={c.image}
                  alt={count ? c.name : "미발견"}
                  fill
                  sizes="(min-width: 768px) 120px, 25vw"
                  className={`object-cover ${count ? "" : "brightness-0 opacity-30"}`}
                />
                <span className="absolute left-1 top-1 rounded bg-black/60 px-1 text-[9px] font-bold text-white/80">
                  {c.rarity}
                </span>
                {count > 0 && PRICES[c.id].won >= 1000 && (
                  <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1 text-[9px] font-bold text-yellow-200">
                    {won(PRICES[c.id].won)}
                  </span>
                )}
                {count > 1 && (
                  <span className="absolute bottom-1 right-1 rounded bg-black/60 px-1 text-[10px] font-bold text-yellow-300">
                    ×{count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {zoom && (
        <CardLightbox
          card={zoom}
          count={collection[zoom.id]}
          onClose={() => setZoom(null)}
        />
      )}
    </div>
  );
}

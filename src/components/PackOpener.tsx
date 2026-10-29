"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { CARDS } from "@/data/cards";
import { seeded } from "@/lib/random";
import { usePackStore } from "@/store/usePackStore";
import type { Card } from "@/types/card";
import CardPack from "./CardPack";
import CardStack from "./CardStack";
import CollectionModal, { CardLightbox } from "./CollectionModal";
import Shop, { won } from "./Shop";

const TEAR_MS = 1250;
const OPEN_MS = 850;

function Starfield() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 60 }, (_, i) => {
        const size = 1 + seeded(i + 3) * 2.5;
        return (
          <span
            key={i}
            className="twinkle"
            style={
              {
                left: `${seeded(i) * 100}%`,
                top: `${seeded(i + 1000) * 100}%`,
                width: size,
                height: size,
                "--dur": `${2 + seeded(i + 7) * 4}s`,
                "--delay": `${seeded(i + 11) * 4}s`,
              } as React.CSSProperties
            }
          />
        );
      })}
    </div>
  );
}

const chip = "rounded-full bg-white/10 px-3 py-1 backdrop-blur";

export default function PackOpener() {
  const {
    phase,
    unopened,
    cards,
    top,
    collection,
    packsOpened,
    spent,
    buy,
    tearPack,
    setPhase,
    swipe,
    skipAll,
    next,
    goShop,
  } = usePackStore();
  const [showCollection, setShowCollection] = useState(false);
  const [zoom, setZoom] = useState<Card | null>(null);
  const closeCollection = useCallback(() => setShowCollection(false), []);

  // 로컬스토리지의 도감은 마운트 후에 불러와 하이드레이션 불일치를 피함
  useEffect(() => {
    usePackStore.persist.rehydrate();
  }, []);

  // 뜯기 → 열림 → 카드 더미 단계 진행
  useEffect(() => {
    if (phase === "tearing") {
      const t = setTimeout(() => setPhase("opening"), TEAR_MS);
      return () => clearTimeout(t);
    }
    if (phase === "opening") {
      const t = setTimeout(() => setPhase("revealed"), OPEN_MS);
      return () => clearTimeout(t);
    }
  }, [phase, setPhase]);

  const owned = Object.keys(collection).length;
  const best = cards[cards.length - 1];
  const packStage = phase === "idle" || phase === "tearing" || phase === "opening";

  return (
    <div className="stage-bg relative flex min-h-screen flex-col items-center overflow-hidden">
      <Starfield />

      {/* 헤더 */}
      <header className="relative z-10 flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-5 sm:px-6">
        <h1 className="text-2xl font-black italic tracking-tight text-yellow-300 drop-shadow-[0_2px_0_#1d3a8a]">
          GATTA!
        </h1>
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-white/80">
          <span className={chip}>
            쓴 돈 <b className="text-yellow-300">{won(spent)}</b>
          </span>
          <span className={chip}>개봉 {packsOpened}팩</span>
          {unopened.length > 0 && <span className={chip}>남은 팩 {unopened.length}</span>}
          {phase !== "shop" && (
            <button type="button" onClick={goShop} className={`${chip} transition hover:bg-white/20`}>
              상점
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowCollection(true)}
            className="rounded-full bg-yellow-300 px-3 py-1 text-[#2a1200] transition hover:brightness-110"
          >
            도감 {owned}/{CARDS.length}
          </button>
        </div>
      </header>

      {/* 무대 */}
      <main className="relative z-10 flex w-full flex-1 flex-col items-center justify-center px-4 pb-10">
        {phase === "shop" && <Shop spent={spent} unopened={unopened.length} onBuy={buy} onBack={next} />}

        {packStage && (
          <div className="flex flex-col items-center">
            <div className="relative">
              <CardPack phase={phase} onTear={tearPack} />
              {/* 팩 안에서 솟아오르는 카드 묶음 */}
              {phase === "opening" && (
                <div className="cards-rise pointer-events-none absolute left-1/2 top-[8%] h-[300px] w-[214px] -translate-x-1/2">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="absolute inset-0 rounded-[14px] border-2 border-yellow-300/70 bg-gradient-to-br from-[#1e3a8a] to-[#0f172a] shadow-[0_0_40px_rgba(255,240,180,0.6)]"
                      style={{ transform: `rotate(${(i - 1) * 5}deg) translateY(${i * -4}px)` }}
                    />
                  ))}
                </div>
              )}
            </div>
            <p
              className={`mt-10 text-sm font-medium text-white/70 transition-opacity ${
                phase === "idle" ? "hint-pulse" : "opacity-0"
              }`}
            >
              팩을 클릭해서 뜯어보세요 · 남은 {unopened.length}팩
            </p>
          </div>
        )}

        {phase === "revealed" && <CardStack cards={cards} top={top} onSwipe={swipe} onSkip={skipAll} />}

        {phase === "done" && (
          <div className="fade-up flex flex-col items-center gap-6">
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
              {cards.map((c) => (
                <button
                  key={c.uid}
                  type="button"
                  onClick={() => setZoom(c)}
                  className="relative aspect-[5/7] w-[104px] cursor-zoom-in overflow-hidden rounded-lg border border-white/20 transition hover:scale-105 sm:w-[132px]"
                >
                  <Image src={c.image} alt={c.name} fill sizes="132px" className="object-cover" />
                  <span className="absolute left-1 top-1 rounded bg-black/60 px-1 text-[10px] font-bold">
                    {c.rarity}
                  </span>
                </button>
              ))}
            </div>
            {best && (
              <p className="text-center text-sm text-white/80">
                이번 팩 최고 카드: <b className="text-yellow-300">{best.name}</b> ({best.rarity})
              </p>
            )}
            <button
              type="button"
              onClick={next}
              className="rounded-full bg-gradient-to-r from-yellow-300 to-orange-400 px-7 py-3 text-sm font-bold text-[#2a1200] shadow-[0_0_30px_rgba(250,204,21,0.5)] transition hover:scale-105 active:scale-95"
            >
              {unopened.length > 0 ? `다음 팩 뜯기 (남은 ${unopened.length}팩)` : "팩 더 사러 가기"}
            </button>
          </div>
        )}
      </main>

      {/* 뜯는 순간 화면 플래시 */}
      {phase === "tearing" && (
        <div
          className="screen-flash pointer-events-none fixed inset-0 z-50 bg-white"
          style={{ animationDelay: "0.55s", opacity: 0 }}
        />
      )}

      {showCollection && <CollectionModal collection={collection} onClose={closeCollection} />}
      {zoom && <CardLightbox card={zoom} onClose={() => setZoom(null)} />}
    </div>
  );
}

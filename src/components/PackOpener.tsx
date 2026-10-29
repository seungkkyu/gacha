"use client";

import { useEffect } from "react";
import { POKEMON } from "@/data/pokemon";
import { seeded } from "@/lib/random";
import { usePackStore } from "@/store/usePackStore";
import CardPack from "./CardPack";
import Collection from "./Collection";
import PokemonCard from "./PokemonCard";

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

export default function PackOpener() {
  const { phase, cards, flipped, collection, packsOpened, tearPack, setPhase, flipCard, flipAll, reset } =
    usePackStore();

  // 로컬스토리지의 도감은 마운트 후에 불러와 하이드레이션 불일치를 피함
  useEffect(() => {
    usePackStore.persist.rehydrate();
  }, []);

  // 뜯기 → 열림 → 공개 단계 진행
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

  const allFlipped = cards.length > 0 && cards.every((c) => flipped[c.uid]);
  const owned = Object.keys(collection).length;
  const best = allFlipped
    ? cards[cards.length - 1]
    : undefined;

  return (
    <div className="stage-bg relative flex min-h-screen flex-col items-center overflow-hidden">
      <Starfield />

      {/* 헤더 */}
      <header className="relative z-10 flex w-full max-w-5xl items-center justify-between px-4 py-5 sm:px-6">
        <h1 className="text-2xl font-black italic tracking-tight text-yellow-300 drop-shadow-[0_2px_0_#1d3a8a]">
          GATTA!
        </h1>
        <div className="flex gap-2 text-xs font-semibold text-white/80">
          <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur">개봉 {packsOpened}팩</span>
          <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur">
            도감 {owned}/{POKEMON.length}
          </span>
        </div>
      </header>

      {/* 무대 */}
      <main className="relative z-10 flex w-full flex-1 flex-col items-center justify-center px-4 pb-10">
        {phase !== "revealed" && (
          <div className="flex flex-col items-center">
            <div className="relative">
              <CardPack phase={phase} onTear={tearPack} />
              {/* 팩 안에서 솟아오르는 카드 묶음 */}
              {phase === "opening" && (
                <div className="cards-rise pointer-events-none absolute left-1/2 top-[12%] -z-0 h-[264px] w-[186px] -translate-x-1/2">
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
              팩을 클릭해서 뜯어보세요
            </p>
          </div>
        )}

        {phase === "revealed" && (
          <div className="flex flex-col items-center">
            <div className="flex max-w-5xl flex-wrap items-center justify-center gap-4 sm:gap-6">
              {cards.map((card, i) => (
                <PokemonCard
                  key={card.uid}
                  card={card}
                  index={i}
                  total={cards.length}
                  flipped={!!flipped[card.uid]}
                  onFlip={() => flipCard(card.uid)}
                />
              ))}
            </div>

            <div className="fade-up mt-10 flex flex-col items-center gap-4" style={{ animationDelay: "0.8s" }}>
              {best && (
                <p className="text-center text-sm text-white/80">
                  이번 팩 최고 카드: <b className="text-yellow-300">{best.name}</b>
                </p>
              )}
              {allFlipped ? (
                <button
                  type="button"
                  onClick={reset}
                  className="rounded-full bg-gradient-to-r from-yellow-300 to-orange-400 px-7 py-3 text-sm font-bold text-[#2a1200] shadow-[0_0_30px_rgba(250,204,21,0.5)] transition hover:scale-105 active:scale-95"
                >
                  한 팩 더 뜯기
                </button>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <p className="hint-pulse text-sm text-white/70">카드를 클릭해서 뒤집어보세요</p>
                  <button
                    type="button"
                    onClick={flipAll}
                    className="rounded-full border border-white/25 bg-white/10 px-5 py-2 text-xs font-semibold text-white/90 backdrop-blur transition hover:bg-white/20"
                  >
                    모두 뒤집기
                  </button>
                </div>
              )}
            </div>
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

      <Collection collection={collection} />
    </div>
  );
}

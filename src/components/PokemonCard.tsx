"use client";

import Image from "next/image";
import { useRef, type CSSProperties, type PointerEvent } from "react";
import { artworkUrl, RARITY_LABEL, TYPE_COLOR } from "@/data/pokemon";
import { isShiny } from "@/lib/gacha";
import type { PulledCard, Rarity } from "@/types/pokemon";
import Particles from "./Particles";

const AURA_COLOR: Record<Rarity, string> = {
  common: "transparent",
  uncommon: "#7dd3fc88",
  rare: "#facc15",
  ultra: "#e879f9",
  legendary: "",
};

const PARTICLE_COLORS: Record<Rarity, string[]> = {
  common: ["#ffffff"],
  uncommon: ["#bae6fd", "#ffffff"],
  rare: ["#fde047", "#fff7cc", "#facc15"],
  ultra: ["#f0abfc", "#c084fc", "#ffffff", "#67e8f9"],
  legendary: ["#ff3b6b", "#ffcc33", "#33ffa0", "#33b8ff", "#b44bff", "#ffffff"],
};

function CardBack() {
  return (
    <div className="card-face bg-gradient-to-br from-[#1e3a8a] via-[#1e40af] to-[#0f172a] p-2 shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[10px] border-2 border-yellow-300/70 bg-[radial-gradient(circle_at_50%_50%,#3b82f6_0%,#1e3a8a_60%,#0b1640_100%)]">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #fff 0 1px, transparent 1px 10px), repeating-linear-gradient(-45deg, #fff 0 1px, transparent 1px 10px)",
          }}
        />
        {/* 몬스터볼 모양 엠블럼 */}
        <div className="relative size-20 overflow-hidden rounded-full border-4 border-[#111] shadow-[0_0_24px_rgba(250,204,21,0.6)]">
          <div className="h-1/2 bg-gradient-to-b from-red-400 to-red-600" />
          <div className="h-1/2 bg-gradient-to-b from-gray-100 to-gray-300" />
          <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 bg-[#111]" />
          <div className="absolute left-1/2 top-1/2 size-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-[#111] bg-white" />
        </div>
        <div className="foil-sweep absolute inset-0" />
      </div>
    </div>
  );
}

function CardFront({ card, revealed }: { card: PulledCard; revealed: boolean }) {
  const color = TYPE_COLOR[card.type];
  const rarity = RARITY_LABEL[card.rarity];
  const shiny = isShiny(card.rarity);
  const legendary = card.rarity === "legendary";

  return (
    <div
      className="card-face card-front p-[7px] shadow-[0_10px_30px_rgba(0,0,0,0.6)]"
      style={{
        background: legendary
          ? "linear-gradient(135deg,#ffe58a,#f5b301 30%,#fff3b0 50%,#d99a00 70%,#ffe58a)"
          : shiny
            ? "linear-gradient(135deg,#f5f5f5,#b8b8c8 40%,#ffffff 55%,#9a9aae)"
            : "linear-gradient(135deg,#fde68a,#facc15)",
      }}
    >
      <div
        className="relative flex h-full flex-col overflow-hidden rounded-[9px] px-2.5 pb-2 pt-1.5"
        style={{ background: `linear-gradient(160deg, ${color.from}, ${color.to})` }}
      >
        {/* 이름 / HP */}
        <div className="flex items-baseline justify-between text-[#1a1a1a]">
          <span className="text-[15px] font-extrabold tracking-tight">{card.name}</span>
          <span className="text-[11px] font-bold">
            <span className="text-[8px]">HP</span> {card.hp}
          </span>
        </div>

        {/* 아트 창 */}
        <div
          className="relative mt-1 aspect-[4/3] w-full overflow-hidden rounded-[4px] border-[3px] border-[#e8d79a] shadow-inner"
          style={{
            background: `radial-gradient(circle at 50% 60%, #ffffffcc 0%, ${color.from} 45%, ${color.to} 100%)`,
          }}
        >
          {revealed && (
            <div className="art-pop absolute inset-1">
              <Image
                src={artworkUrl(card.id)}
                alt={card.name}
                fill
                sizes="180px"
                className="object-contain drop-shadow-[0_6px_6px_rgba(0,0,0,0.35)]"
              />
            </div>
          )}
          {shiny && <div className="holo-sparkle pointer-events-none absolute inset-0" />}
        </div>

        {/* 타입 / 번호 */}
        <div className="mt-1.5 flex items-center justify-between text-[9px] font-semibold text-[#1a1a1a]/80">
          <span className="rounded-full bg-white/60 px-2 py-0.5">{color.label} 타입</span>
          <span>No.{String(card.id).padStart(3, "0")}</span>
        </div>

        {/* 기술 (장식) */}
        <div className="mt-1.5 flex-1 rounded-[4px] bg-white/35 px-2 py-1.5 text-[#1a1a1a]">
          <div className="flex items-center justify-between text-[11px] font-bold">
            <span>몸통박치기</span>
            <span>{Math.round(card.hp / 3 / 10) * 10}</span>
          </div>
          <div className="mt-1 h-px bg-black/15" />
          <p className="mt-1 text-[8px] leading-tight text-black/60">
            팩에서 뽑힌 {rarity.label.toLowerCase()} 카드. 소중히 다뤄주세요.
          </p>
        </div>

        {/* 레어도 */}
        <div className="mt-1.5 flex items-center justify-between">
          <span className="text-[8px] font-black tracking-widest text-black/70">{rarity.label}</span>
          <span className={`text-[11px] ${legendary ? "text-yellow-100" : "text-black/70"}`}>
            {"★".repeat(rarity.stars)}
          </span>
        </div>
      </div>

      {shiny && <div className="holo pointer-events-none absolute inset-0 rounded-[14px]" />}
    </div>
  );
}

interface Props {
  card: PulledCard;
  index: number;
  total: number;
  flipped: boolean;
  onFlip: () => void;
}

export default function PokemonCard({ card, index, total, flipped, onFlip }: Props) {
  const tiltRef = useRef<HTMLDivElement>(null);
  const shiny = isShiny(card.rarity);
  const big = card.rarity === "ultra" || card.rarity === "legendary";

  const handleMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = tiltRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    el.style.setProperty("--rx", `${(0.5 - py) * 20}deg`);
    el.style.setProperty("--ry", `${(px - 0.5) * 20}deg`);
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
    el.style.setProperty("--angle", `${(px - 0.5) * 60}deg`);
  };
  const handleLeave = () => {
    const el = tiltRef.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };

  const offset = index - (total - 1) / 2;
  const dealStyle = {
    "--deal-delay": `${index * 0.12}s`,
    "--from-x": `${-offset * 120}px`,
    "--from-rot": `${-offset * 8}deg`,
  } as CSSProperties;

  return (
    <div className="card-deal relative" style={dealStyle}>
      {/* 레어 오라 */}
      <div
        className={`aura ${flipped && card.rarity !== "common" ? "on" : ""} ${
          card.rarity === "legendary" ? "aura-legendary" : ""
        }`}
        style={card.rarity === "legendary" ? undefined : { background: AURA_COLOR[card.rarity] }}
      />

      {flipped && big && (
        <div className="rays pointer-events-none absolute left-1/2 top-1/2 -z-10 size-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full" />
      )}
      {flipped && shiny && (
        <Particles
          colors={PARTICLE_COLORS[card.rarity]}
          count={big ? 44 : 26}
          distance={big ? 260 : 170}
          seed={card.id + index}
        />
      )}

      <div className={!flipped && shiny ? "card-tease" : ""}>
        <div
          ref={tiltRef}
          className="card-3d h-[264px] w-[186px] sm:h-[294px] sm:w-[208px]"
          onPointerMove={handleMove}
          onPointerLeave={handleLeave}
        >
          <div className="card-tilt h-full w-full">
            <button
              type="button"
              aria-label={flipped ? card.name : "카드 뒤집기"}
              onClick={onFlip}
              disabled={flipped}
              className={`card-inner block cursor-pointer disabled:cursor-default ${flipped ? "is-flipped" : ""}`}
            >
              <CardBack />
              <CardFront card={card} revealed={flipped} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

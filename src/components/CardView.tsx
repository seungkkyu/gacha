"use client";

import Image from "next/image";
import { useRef, type PointerEvent } from "react";
import { isShiny } from "@/lib/gacha";
import type { PulledCard, Tier } from "@/types/card";
import Particles from "./Particles";

const AURA_COLOR: Record<Tier, string> = {
  common: "transparent",
  uncommon: "#7dd3fc88",
  rare: "#facc15",
  ultra: "#e879f9",
  legendary: "",
};

const PARTICLE_COLORS: Record<Tier, string[]> = {
  common: ["#ffffff"],
  uncommon: ["#bae6fd", "#ffffff"],
  rare: ["#fde047", "#fff7cc", "#facc15"],
  ultra: ["#f0abfc", "#c084fc", "#ffffff", "#67e8f9"],
  legendary: ["#ff3b6b", "#ffcc33", "#33ffa0", "#33b8ff", "#b44bff", "#ffffff"],
};

interface Props {
  card: PulledCard;
  /** 더미 맨 위에 올라와 공개된 상태: 오라·파티클 연출 */
  active: boolean;
  priority?: boolean;
}

/** 실제 카드 이미지 + 레어도별 연출 */
export default function CardView({ card, active, priority }: Props) {
  const tiltRef = useRef<HTMLDivElement>(null);
  const shiny = isShiny(card.tier);
  const big = card.tier === "ultra" || card.tier === "legendary";
  const legendary = card.tier === "legendary";

  const handleMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = tiltRef.current;
    if (!el || !active) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    el.style.setProperty("--rx", `${(0.5 - py) * 16}deg`);
    el.style.setProperty("--ry", `${(px - 0.5) * 16}deg`);
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
    el.style.setProperty("--angle", `${(px - 0.5) * 60}deg`);
  };
  const handleLeave = () => {
    tiltRef.current?.style.setProperty("--rx", "0deg");
    tiltRef.current?.style.setProperty("--ry", "0deg");
  };

  return (
    <div className="relative h-full w-full">
      <div
        className={`aura ${active && card.tier !== "common" ? "on" : ""} ${legendary ? "aura-legendary" : ""}`}
        style={legendary ? undefined : { background: AURA_COLOR[card.tier] }}
      />
      {active && big && (
        <div className="rays pointer-events-none absolute left-1/2 top-1/2 -z-10 size-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full" />
      )}
      {active && shiny && (
        <Particles
          colors={PARTICLE_COLORS[card.tier]}
          count={big ? 44 : 26}
          distance={big ? 300 : 200}
          seed={Number(card.id)}
        />
      )}

      <div
        ref={tiltRef}
        className="card-3d h-full w-full"
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
      >
        <div className="card-tilt relative h-full w-full overflow-hidden rounded-[14px] bg-[#111] shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
          <Image
            src={card.image}
            alt={`${card.name} (${card.rarity})`}
            fill
            sizes="300px"
            priority={priority}
            draggable={false}
            className="select-none object-cover"
          />
          {shiny && <div className="holo-sparkle pointer-events-none absolute inset-0" />}
          {shiny && <div className="holo pointer-events-none absolute inset-0" />}
        </div>
      </div>
    </div>
  );
}

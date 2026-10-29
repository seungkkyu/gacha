"use client";

import Image from "next/image";
import { useRef, type PointerEvent } from "react";
import { PACK_IMAGE, SET_NAME } from "@/data/cards";
import type { PackPhase } from "@/types/card";

const TEAR_AT = 10; // 팩 상단(크림프 바로 아래)에서 뜯기는 위치 (%)

/** 뜯긴 경계의 들쭉날쭉한 톱니 좌표 */
const JAGGED = Array.from({ length: 19 }, (_, i) => {
  const x = (i / 18) * 100;
  const y = TEAR_AT + (i % 2 === 0 ? -1.2 : 1.2) + (i % 3 === 0 ? 0.6 : 0);
  return `${x}% ${y}%`;
});

const TOP_CLIP = `polygon(0% 0%, 100% 0%, ${[...JAGGED].reverse().join(", ")})`;
const BODY_CLIP = `polygon(${JAGGED.join(", ")}, 100% 100%, 0% 100%)`;

function PackArt() {
  return (
    <div className="absolute inset-0">
      <Image
        src={PACK_IMAGE}
        alt={SET_NAME}
        fill
        sizes="230px"
        priority
        draggable={false}
        className="select-none object-fill"
      />
      {/* 광택은 팩 모양 안에서만 */}
      <div
        className="foil-sweep pointer-events-none absolute inset-0"
        style={{ maskImage: `url(${PACK_IMAGE})`, maskSize: "100% 100%" }}
      />
    </div>
  );
}

interface Props {
  phase: PackPhase;
  onTear: () => void;
}

export default function CardPack({ phase, onTear }: Props) {
  const tiltRef = useRef<HTMLDivElement>(null);
  const idle = phase === "idle";
  const tearing = phase === "tearing";
  const opening = phase === "opening";

  const handleMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!idle || !tiltRef.current) return;
    const rect = tiltRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    tiltRef.current.style.setProperty("--rx", `${-py * 18}deg`);
    tiltRef.current.style.setProperty("--ry", `${px * 22}deg`);
  };
  const handleLeave = () => {
    tiltRef.current?.style.setProperty("--rx", "0deg");
    tiltRef.current?.style.setProperty("--ry", "0deg");
  };

  return (
    <div className={idle ? "pack-float" : ""}>
      <div
        ref={tiltRef}
        className="pack-tilt"
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
      >
        <button
          type="button"
          aria-label="카드팩 뜯기"
          onClick={onTear}
          disabled={!idle}
          className={`relative block h-[440px] w-[211px] cursor-pointer outline-none transition-[filter] duration-300 hover:brightness-110 disabled:cursor-default ${
            tearing ? "pack-shake" : ""
          }`}
        >
          {/* 빛줄기 (팩 뒤에서 위로 뿜어져 나옴) */}
          {(tearing || opening) && (
            <div
              className="light-beam pointer-events-none absolute left-1/2 h-[520px] w-[520px] -translate-x-1/2 origin-bottom"
              style={{ bottom: `${100 - TEAR_AT}%` }}
            />
          )}

          {/* 몸통 */}
          <div
            className={`absolute inset-0 drop-shadow-[0_20px_30px_rgba(0,0,0,0.6)] ${opening ? "pack-body-drop" : ""}`}
            style={{ clipPath: BODY_CLIP }}
          >
            <PackArt />
          </div>

          {/* 뜯기는 윗부분 */}
          <div
            className={`absolute inset-0 ${tearing || opening ? "pack-top-tear" : ""}`}
            style={{ clipPath: TOP_CLIP }}
          >
            <PackArt />
          </div>

          {/* 찢어진 틈의 빛 */}
          {(tearing || opening) && (
            <div
              className={`tear-glow pointer-events-none absolute inset-x-0 h-2 rounded-full bg-white shadow-[0_0_30px_12px_rgba(255,240,180,0.9)] ${
                opening ? "pack-body-drop" : ""
              }`}
              style={{ top: `calc(${TEAR_AT}% - 4px)` }}
            />
          )}
        </button>
      </div>
    </div>
  );
}

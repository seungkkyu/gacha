"use client";

import { useRef, useState, type CSSProperties, type PointerEvent } from "react";
import type { PulledCard } from "@/types/card";
import CardBack from "./CardBack";
import CardView from "./CardView";

const SWIPE_MS = 750;
/** 위로 끈 거리(px) → 넘어간 각도(deg) */
const DRAG_TO_DEG = 0.55;
/** 이 각도 이상 넘기고 놓으면 넘어감 */
const FLIP_THRESHOLD_DEG = 35;
/** 더미에서 보여줄 최대 깊이 */
const VISIBLE_DEPTH = 4;

interface Props {
  cards: PulledCard[];
  top: number;
  onSwipe: () => void;
  onSkip: () => void;
}

/**
 * 카드 더미. 맨 위 카드는 윗변이 경첩처럼 고정돼, 위로 끌거나 클릭하면
 * 달력 넘기듯 위로 젖혀지며(뒷면이 보임) 날아가고 다음 카드가 드러남
 */
export default function CardStack({ cards, top, onSwipe, onSkip }: Props) {
  const [leaving, setLeaving] = useState<{ uid: string; fromDeg: number } | null>(null);
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startY = useRef(0);

  const angle = Math.min(170, Math.max(0, -dragY * DRAG_TO_DEG));

  const swipe = (fromDeg = 0) => {
    if (leaving || top >= cards.length) return;
    setLeaving({ uid: cards[top].uid, fromDeg });
    setDragY(0);
    setTimeout(() => {
      onSwipe();
      setLeaving(null);
    }, SWIPE_MS);
  };

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    if (leaving) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    startY.current = e.clientY;
    setDragging(true);
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const dy = e.clientY - startY.current;
    // 아래로는 살짝만 끌리게
    setDragY(dy < 0 ? dy : dy * 0.2);
  };
  const onUp = () => {
    if (!dragging) return;
    setDragging(false);
    // 거의 안 움직였으면 클릭으로 보고 넘김
    if (angle > FLIP_THRESHOLD_DEG || Math.abs(dragY) < 6) swipe(angle);
    else setDragY(0);
  };

  // 넘어가는 중인 카드 다음 장이 실제로 보이는 맨 위 카드
  const shownTop = leaving ? top + 1 : top;

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative mt-[120px] h-[336px] w-[240px] sm:h-[392px] sm:w-[280px]"
        style={{ perspective: "1600px", transformStyle: "preserve-3d" }}
      >
        {cards.map((card, i) => {
          if (i < top) return null;
          const isLeaving = leaving?.uid === card.uid;
          const isTop = i === top && !leaving;
          const depth = Math.max(0, i - shownTop);
          if (depth > VISIBLE_DEPTH) return null;

          const style = {
            zIndex: cards.length - i,
            "--from-deg": `${leaving?.fromDeg ?? 0}deg`,
            transformOrigin: "50% 0%",
            transformStyle: "preserve-3d",
            transform: isLeaving
              ? undefined
              : isTop
                ? // 아래로 끌면 살짝 내려가기만, 위로 끌면 경첩 회전
                  dragY > 0
                  ? `translateY(${dragY}px)`
                  : `rotateX(${angle}deg)`
                : `translateY(${depth * 10}px) scale(${1 - depth * 0.04})`,
            transition: isTop && dragging ? "none" : "transform 0.35s cubic-bezier(0.2, 0.9, 0.3, 1.1)",
          } as CSSProperties;

          return (
            <div
              key={card.uid}
              className={`absolute inset-0 ${isLeaving ? "card-flip-up" : ""} ${
                isTop ? "cursor-grab touch-none active:cursor-grabbing" : "pointer-events-none"
              }`}
              style={style}
              onPointerDown={isTop ? onDown : undefined}
              onPointerMove={isTop ? onMove : undefined}
              onPointerUp={isTop ? onUp : undefined}
              onPointerCancel={isTop ? onUp : undefined}
              onKeyDown={isTop ? (e) => (e.key === "Enter" || e.key === " ") && swipe() : undefined}
              role={isTop ? "button" : undefined}
              tabIndex={isTop ? 0 : -1}
              aria-label={isTop ? `${card.name} (${card.rarity}) — 넘기기` : undefined}
            >
              {/* 앞면 (아래 깔린 카드는 어둡게) */}
              <div className={`backface-hidden h-full ${depth > 0 ? "brightness-[0.55]" : ""}`}>
                <CardView card={card} active={i === shownTop} priority={i <= 1} />
              </div>
              {/* 뒷면: 위로 젖혀지면 보임 */}
              {(isTop || isLeaving) && (
                <div className="backface-hidden absolute inset-0 [transform:rotateX(180deg)]">
                  <CardBack />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex items-center gap-3 text-sm text-white/70">
        <span className="tabular-nums">
          {Math.min(shownTop + 1, cards.length)} / {cards.length}
        </span>
        <span className="hint-pulse">위로 넘기거나 클릭</span>
        <button
          type="button"
          onClick={onSkip}
          className="rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white/90 backdrop-blur transition hover:bg-white/20"
        >
          모두 넘기기
        </button>
      </div>
    </div>
  );
}

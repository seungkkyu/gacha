"use client";

import { useRef, useState, type CSSProperties, type PointerEvent } from "react";
import type { PulledCard } from "@/types/card";
import CardView from "./CardView";

const SWIPE_MS = 420;
/** 이만큼 위로 끌면 넘김 (px) */
const SWIPE_THRESHOLD = 60;
/** 더미에서 보여줄 최대 깊이 */
const VISIBLE_DEPTH = 4;

interface Props {
  cards: PulledCard[];
  top: number;
  onSwipe: () => void;
  onSkip: () => void;
}

/** 카드 더미. 맨 위 카드를 위로 쓸어 올리거나 클릭하면 넘어가고 다음 카드가 드러남 */
export default function CardStack({ cards, top, onSwipe, onSkip }: Props) {
  const [leaving, setLeaving] = useState<{ uid: string; dragY: number } | null>(null);
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startY = useRef(0);

  const swipe = (fromY = 0) => {
    if (leaving || top >= cards.length) return;
    setLeaving({ uid: cards[top].uid, dragY: fromY });
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
    if (dragY < -SWIPE_THRESHOLD || Math.abs(dragY) < 6) swipe(dragY);
    else setDragY(0);
  };

  // 넘어가는 중인 카드 다음 장이 실제로 보이는 맨 위 카드
  const shownTop = leaving ? top + 1 : top;

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-[336px] w-[240px] sm:h-[392px] sm:w-[280px]">
        {cards.map((card, i) => {
          if (i < top) return null;
          const isLeaving = leaving?.uid === card.uid;
          const isTop = i === top && !leaving;
          const depth = Math.max(0, i - shownTop);
          if (depth > VISIBLE_DEPTH) return null;

          const style = {
            zIndex: cards.length - i,
            "--drag-y": `${leaving?.dragY ?? 0}px`,
            transform: isLeaving
              ? undefined
              : isTop
                ? `translateY(${dragY}px) rotate(${dragY * 0.03}deg)`
                : `translateY(${depth * 10}px) scale(${1 - depth * 0.04})`,
            transition: isTop && dragging ? "none" : "transform 0.35s cubic-bezier(0.2, 0.9, 0.3, 1.1)",
          } as CSSProperties;

          return (
            <div
              key={card.uid}
              className={`absolute inset-0 ${isLeaving ? "card-swipe-up" : ""} ${
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
              {/* 아래 깔린 카드는 어둡게 */}
              <div className={depth > 0 ? "brightness-[0.55]" : ""} style={{ height: "100%" }}>
                <CardView card={card} active={i === shownTop} priority={i <= 1} />
              </div>
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

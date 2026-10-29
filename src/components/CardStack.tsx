"use client";

import { useRef, useState, type CSSProperties, type PointerEvent } from "react";
import type { PulledCard } from "@/types/card";
import CardView from "./CardView";

const SWIPE_MS = 700;
/** 이만큼 위로 끌고 놓으면 넘김 (px) */
const SWIPE_THRESHOLD = 50;
/** 더미에서 보여줄 최대 깊이 */
const VISIBLE_DEPTH = 4;

/** 더미 깊이별 위치: 뒤로 갈수록 조금씩 아래로 삐져나오고 작아짐 */
const depthTransform = (depth: number) => `translateY(${depth * 12}px) scale(${1 - depth * 0.04})`;

interface Props {
  cards: PulledCard[];
  top: number;
  onSwipe: () => void;
  onSkip: () => void;
}

/**
 * 카드 더미. 실물 팩을 볼 때처럼 맨 앞 카드를 위로 뽑아 올려 더미 맨 뒤로 넘김.
 * 본 카드는 사라지지 않고 뒤에 쌓이며, 다음 카드가 앞으로 올라옴
 */
export default function CardStack({ cards, top, onSwipe, onSkip }: Props) {
  const [leaving, setLeaving] = useState<{ uid: string; fromY: number } | null>(null);
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startY = useRef(0);

  const swipe = (fromY = 0) => {
    if (leaving || top >= cards.length) return;
    setLeaving({ uid: cards[top].uid, fromY });
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

  // 넘어가는 중이면 그 카드는 이미 맨 뒤로 간 것으로 보고 순서를 매김
  const front = leaving ? top + 1 : top;
  // 앞으로 볼 카드 → 이미 본 카드(뒤에 쌓임) 순서
  const order = [...cards.slice(front), ...cards.slice(0, front)];

  return (
    <div className="flex flex-col items-center">
      <div className="relative mt-16 h-[336px] w-[240px] sm:h-[392px] sm:w-[280px]">
        {cards.map((card) => {
          const depth = order.indexOf(card);
          const isLeaving = leaving?.uid === card.uid;
          const isTop = depth === 0 && !leaving && top < cards.length;

          const style = {
            zIndex: cards.length - depth,
            "--from-y": `${leaving?.fromY ?? 0}px`,
            "--back": depthTransform(depth),
            transform: isLeaving
              ? undefined
              : isTop && dragY
                ? `translateY(${dragY}px) rotate(${dragY * -0.02}deg)`
                : depthTransform(depth),
            opacity: depth > VISIBLE_DEPTH ? 0 : 1,
            transition: isTop && dragging ? "none" : "transform 0.45s cubic-bezier(0.2, 0.9, 0.3, 1.05)",
          } as CSSProperties;

          return (
            <div
              key={card.uid}
              className={`absolute inset-0 ${isLeaving ? "card-to-back" : ""} ${
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
              aria-label={isTop ? `${card.name} (${card.rarity}) — 뒤로 넘기기` : undefined}
            >
              {/* 뒤에 깔린 카드는 어둡게 */}
              <div
                className="h-full transition-[filter] duration-300"
                style={{ filter: depth > 0 && !isLeaving ? "brightness(0.55)" : undefined }}
              >
                <CardView card={card} active={depth === 0 && !isLeaving} priority={depth <= 1} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10 flex items-center gap-3 text-sm text-white/70">
        <span className="tabular-nums">
          {Math.min(front + 1, cards.length)} / {cards.length}
        </span>
        <span className="hint-pulse">위로 끌어 뒤로 넘기거나 클릭</span>
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

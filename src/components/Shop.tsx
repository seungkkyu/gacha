"use client";

import Image from "next/image";
import { useState } from "react";
import { PACK_IMAGE, RARITY_ORDER, SET_NAME } from "@/data/cards";
import {
  BOX_FIXED,
  BOX_PRICE,
  chanceAtLeastOne,
  HIT_SLOT_RATES,
  PACK_PRICE,
  PACKS_PER_BOX,
  SR_PLUS_RATES,
} from "@/data/rates";
import { expectedPackValue, PRICE_DATE } from "@/data/prices";
import type { Rarity } from "@/types/card";

export const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;
const pct = (p: number) => `${(p * 100).toFixed(p < 0.01 ? 2 : 1)}%`;

const PRESETS: { label: string; boxes: number; packs: number }[] = [
  { label: "1팩", boxes: 0, packs: 1 },
  { label: "5팩", boxes: 0, packs: 5 },
  { label: "10팩", boxes: 0, packs: 10 },
  { label: "1박스", boxes: 1, packs: 0 },
  { label: "3박스", boxes: 3, packs: 0 },
];

const CHANCES: { label: string; rarities: Rarity[] }[] = [
  { label: "AR 이상", rarities: ["AR", "SR", "SAR", "MUR"] },
  { label: "SR 이상", rarities: ["SR", "SAR", "MUR"] },
  { label: "SAR 이상", rarities: ["SAR", "MUR"] },
  { label: "MUR", rarities: ["MUR"] },
];

function Stepper({ label, sub, value, onChange }: {
  label: string;
  sub: string;
  value: number;
  onChange: (v: number) => void;
}) {
  const btn =
    "size-8 rounded-full bg-white/10 text-lg font-bold leading-none transition hover:bg-white/20 disabled:opacity-30";
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-xs text-white/50">{sub}</p>
      </div>
      <div className="flex items-center gap-2">
        <button type="button" className={btn} disabled={value <= 0} onClick={() => onChange(value - 1)} aria-label={`${label} 빼기`}>
          −
        </button>
        <input
          type="number"
          min={0}
          max={99}
          value={value}
          onChange={(e) => onChange(Math.max(0, Math.min(99, Number(e.target.value) || 0)))}
          className="w-12 rounded-md bg-white/10 py-1 text-center text-sm font-bold tabular-nums outline-none focus:ring-2 focus:ring-yellow-300/60"
          aria-label={`${label} 수량`}
        />
        <button type="button" className={btn} disabled={value >= 99} onClick={() => onChange(value + 1)} aria-label={`${label} 더하기`}>
          +
        </button>
      </div>
    </div>
  );
}

interface Props {
  spent: number;
  unopened: number;
  onBuy: (boxes: number, packs: number) => void;
  onBack?: () => void;
}

export default function Shop({ spent, unopened, onBuy, onBack }: Props) {
  const [boxes, setBoxes] = useState(1);
  const [packs, setPacks] = useState(0);
  const total = boxes * BOX_PRICE + packs * PACK_PRICE;
  const count = boxes * PACKS_PER_BOX + packs;
  const expected = expectedPackValue() * count;

  return (
    <div className="fade-up w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur sm:p-6">
      <div className="flex items-center gap-4">
        <div className="relative h-28 w-[54px] shrink-0 rotate-[-6deg]">
          <Image src={PACK_IMAGE} alt={SET_NAME} fill sizes="60px" className="object-contain drop-shadow-lg" />
        </div>
        <div>
          <h2 className="text-lg font-black">{SET_NAME}</h2>
          <p className="mt-1 text-xs text-white/60">
            1팩 5장 · {won(PACK_PRICE)} / 1박스 {PACKS_PER_BOX}팩 · {won(BOX_PRICE)}
          </p>
          <p className="mt-1 text-xs text-white/60">지금까지 쓴 돈 <b className="text-yellow-300">{won(spent)}</b></p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-1.5">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => {
              setBoxes(p.boxes);
              setPacks(p.packs);
            }}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
              boxes === p.boxes && packs === p.packs
                ? "bg-yellow-300 text-[#2a1200]"
                : "bg-white/10 text-white/80 hover:bg-white/20"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        <Stepper label="박스" sub={`${PACKS_PER_BOX}팩 · ${won(BOX_PRICE)} · 확정 구성 포함`} value={boxes} onChange={setBoxes} />
        <Stepper label="낱팩" sub={`${won(PACK_PRICE)} · 확정 없음`} value={packs} onChange={setPacks} />
      </div>

      {/* 이번 구매로 뽑을 확률 */}
      <div className="mt-5 rounded-xl bg-black/25 p-3">
        <p className="text-xs font-semibold text-white/70">이번 구매({count}팩)로 1장 이상 뽑을 확률</p>
        <div className="mt-2 grid grid-cols-4 gap-2 text-center">
          {CHANCES.map((c) => (
            <div key={c.label} className="rounded-lg bg-white/5 py-2">
              <p className="text-[10px] text-white/50">{c.label}</p>
              <p className="text-sm font-bold tabular-nums text-yellow-200">
                {count ? pct(chanceAtLeastOne(c.rarities, boxes, packs)) : "-"}
              </p>
            </div>
          ))}
        </div>
      </div>

      {count > 0 && (
        <p className="mt-3 text-center text-xs text-white/70">
          기대 가치 약 <b className="text-white">{won(Math.round(expected / 100) * 100)}</b> ·{" "}
          <b className={expected >= total ? "text-emerald-300" : "text-rose-300"}>
            평균 {expected >= total ? "이득" : "손해"} {won(Math.round(Math.abs(total - expected) / 100) * 100)}
          </b>
        </p>
      )}

      <button
        type="button"
        disabled={count === 0}
        onClick={() => onBuy(boxes, packs)}
        className="mt-5 w-full rounded-full bg-gradient-to-r from-yellow-300 to-orange-400 py-3 text-sm font-bold text-[#2a1200] shadow-[0_0_30px_rgba(250,204,21,0.4)] transition hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
      >
        {count ? `${won(total)} 결제하고 ${count}팩 받기` : "수량을 골라주세요"}
      </button>
      {onBack && unopened > 0 && (
        <button type="button" onClick={onBack} className="mt-2 w-full py-2 text-xs text-white/60 hover:text-white">
          남은 {unopened}팩 마저 뜯으러 가기
        </button>
      )}

      <details className="mt-4 text-xs text-white/60">
        <summary className="cursor-pointer select-none text-white/70">확률 정보 (비공식 추정치)</summary>
        <p className="mt-2 leading-relaxed">
          공식 확률은 발표되지 않았습니다. 판매점·커뮤니티 개봉 샘플을 참고한 추정치입니다.
          1팩 = C 3장 + U 1장 + 레어 슬롯 1장(R 이상).
        </p>
        <p className="mt-3 font-semibold text-white/70">낱팩 레어 슬롯</p>
        <ul className="mt-1 grid grid-cols-3 gap-x-3 gap-y-0.5 tabular-nums">
          {RARITY_ORDER.filter((r) => HIT_SLOT_RATES[r]).map((r) => (
            <li key={r} className="flex justify-between">
              <span>{r}</span>
              <span>{pct(HIT_SLOT_RATES[r]!)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 font-semibold text-white/70">1박스 확정 구성</p>
        <ul className="mt-1 list-inside list-disc space-y-0.5">
          {Object.entries(BOX_FIXED).map(([r, n]) => (
            <li key={r}>
              {r} {n}장
            </li>
          ))}
          <li>
            SR 이상 1장 (
            {Object.entries(SR_PLUS_RATES)
              .map(([r, p]) => `${r} ${pct(p!)}`)
              .join(" · ")}
            )
          </li>
          <li>나머지 레어 슬롯은 R</li>
        </ul>
        <p className="mt-3 font-semibold text-white/70">시세 ({PRICE_DATE} 기준)</p>
        <p className="mt-1 leading-relaxed">
          한글판 실거래가(KREAM)가 있는 카드는 그 값을, 나머지는 일본판 매입가를 한글판 비율로 환산한
          추정치를 씁니다. C·U·R 은 0원으로 봅니다. 기대 가치는 확률 × 시세의 평균값이라 실제 결과와 다를 수 있습니다.
        </p>
      </details>
    </div>
  );
}

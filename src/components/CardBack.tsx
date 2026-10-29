"use client";

import Image from "next/image";
import { useState } from "react";
import { CARD_BACK } from "@/data/cards";

/** 공식 카드 뒷면 이미지. 파일이 없으면 CSS 로 그린 뒷면을 보여줌 */
export default function CardBack() {
  const [missing, setMissing] = useState(false);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-[14px] bg-gradient-to-br from-[#1e3a8a] via-[#1e40af] to-[#0f172a] shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
      {missing ? (
        <div className="absolute inset-2 flex items-center justify-center rounded-[10px] border-2 border-yellow-300/70 bg-[radial-gradient(circle_at_50%_50%,#3b82f6_0%,#1e3a8a_60%,#0b1640_100%)]">
          {/* 몬스터볼 모양 엠블럼 */}
          <div className="relative size-20 overflow-hidden rounded-full border-4 border-[#111]">
            <div className="h-1/2 bg-gradient-to-b from-red-400 to-red-600" />
            <div className="h-1/2 bg-gradient-to-b from-gray-100 to-gray-300" />
            <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 bg-[#111]" />
            <div className="absolute left-1/2 top-1/2 size-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-[#111] bg-white" />
          </div>
        </div>
      ) : (
        <Image
          src={CARD_BACK}
          alt="카드 뒷면"
          fill
          sizes="300px"
          draggable={false}
          onError={() => setMissing(true)}
          className="select-none object-cover"
        />
      )}
    </div>
  );
}

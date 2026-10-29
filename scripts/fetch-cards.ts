/**
 * pokemoncard.co.kr 에서 확장팩 하나의 카드 정보 + 이미지를 받아 로컬에 저장 (개인 학습용)
 *
 *   node scripts/fetch-cards.ts                       # 기본: 스톰에메랄다
 *   node scripts/fetch-cards.ts "MEGA 확장팩 「...」"
 *   MAX=3 node scripts/fetch-cards.ts                 # 앞에서 3장만 (테스트용)
 *
 * 결과: src/data/cards/<세트코드>.json, public/cards/<세트코드>/<번호>.webp, pack.webp
 * 팩 이미지 주소는 PACK_URL 로 지정 (기본 세트는 내장)
 * 이미 받은 이미지는 건너뛰므로 중간에 끊겨도 다시 실행하면 이어서 받음.
 */
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const BASE = "https://pokemoncard.co.kr";
const DEFAULT_SET = "MEGA 확장팩 「스톰에메랄다」";
const SET_NAME = process.argv[2] ?? DEFAULT_SET;
const PACK_URL =
  process.env.PACK_URL ??
  (SET_NAME === DEFAULT_SET
    ? `${BASE}/s3.php?key=home%2Fdata%2Fdata1_www%2F2026%2F08%2F2026-08-11_14-11-21-60448-1786425081.png`
    : undefined);
const MAX = Number(process.env.MAX ?? Infinity);
const DELAY_MS = 1000; // 서버 부담을 줄이기 위해 요청 간 간격
const HEADERS = {
  "User-Agent": "Mozilla/5.0 (gatta personal card fetcher)",
  "X-Requested-With": "XMLHttpRequest",
  Referer: `${BASE}/cards`,
};

interface Attack {
  name: string;
  cost: string[];
  damage: string;
  text: string;
}

interface CardData {
  cardNum: string;
  setCode: string;
  number: string;
  rarity: string;
  name: string;
  hp: number | null;
  type: string | null;
  kind: string | null;
  illustrator: string | null;
  attacks: Attack[];
  weakness: string | null;
  resistance: string | null;
  image: string;
  sourceUrl: string;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const clean = (s: string) =>
  s
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/[ \t]+/g, " ")
    .trim();

const match = (html: string, re: RegExp) => {
  const m = html.match(re);
  return m ? clean(m[1]) : null;
};

async function listCards(): Promise<{ CardNum: string; feature_image: string }[]> {
  const all: { CardNum: string; feature_image: string }[] = [];
  for (let page = 0; ; page++) {
    const body = new URLSearchParams({
      action: "search_text_cards",
      search_text: SET_NAME,
      search_params: "all",
      limit: String(page),
    });
    const res = await fetch(`${BASE}/v2/ajax2_dev2`, { method: "POST", body, headers: HEADERS });
    const text = await res.text();
    let json: { status: boolean; result?: Record<string, { CardNum: string; feature_image: string }> };
    try {
      json = JSON.parse(text);
    } catch {
      throw new Error(`목록 응답이 JSON 이 아님 (page ${page}): ${text.slice(0, 100)}`);
    }
    const items = Object.values(json.result ?? {});
    if (!json.status || items.length === 0) break;
    all.push(...items);
    console.log(`목록 page ${page}: ${items.length}장 (누적 ${all.length})`);
    if (all.length >= MAX) break;
    await sleep(DELAY_MS);
  }
  // 페이지 경계에서 중복이 생길 수 있어 제거
  return [...new Map(all.map((c) => [c.CardNum, c])).values()].slice(0, MAX);
}

function parseDetail(html: string, cardNum: string): Omit<CardData, "image"> & { remoteImage: string } {
  const imgPath = html.match(/<img src="([^"]+)" class="feature_image"/)?.[1] ?? "";
  const numBlock = html.match(/<span class="p_num">([\s\S]*?)<\/span>\s*<\/span>/)?.[1] ?? "";
  const number = clean(numBlock.split("<span")[0]);
  const rarity = match(numBlock, /id="no_wrap_by_admin">([^<]*)/) ?? "";
  const setCode = imgPath.match(/wmimages\/[^/]+\/([^/]+)\//)?.[1] ?? "UNKNOWN";

  const hpBlock = html.match(/<span class="card-hp">([\s\S]*?)<\/span>\s*<\/div>/)?.[1] ?? "";
  const hpText = match(html, /<span class="hp_num">([^<]*)/);

  // 기술 블록: <div class="ability"> 마다 비용 아이콘 → 기술명 / 데미지(없을 수 있음) → 설명(없을 수 있음)
  const abilitySection = html.split('<div class="pokemon-stats">')[0];
  const attacks: Attack[] = abilitySection
    .split('<div class="ability')
    .slice(1)
    .map((block) => ({
      cost: [...block.matchAll(/class="type_b"[^>]*title="([^"]+)"/g)].map((t) => t[1]),
      name: match(block, /<span class="skil_name">([\s\S]*?)<\/span>/) ?? "",
      damage: match(block, /<span class="plus">([\s\S]*?)<\/span>/) ?? "",
      text: match(block, /<p>([\s\S]*?)<\/p>/) ?? "",
    }))
    .filter((a) => a.name);

  const stat = (label: string) => {
    const block = html.match(new RegExp(`<h4>${label}</h4>([\\s\\S]*?)</div>`))?.[1];
    if (!block) return null;
    const type = block.match(/title="([^"]+)"/)?.[1];
    const value = clean(block);
    return type ? `${type} ${value}`.trim() : value || null;
  };

  return {
    cardNum,
    setCode,
    number,
    rarity,
    name: match(html, /<span class="card-hp title">([\s\S]*?)<\/span>/) ?? "",
    hp: hpText ? Number(hpText.replace(/\D/g, "")) || null : null,
    type: hpBlock.match(/title="([^"]+)"/)?.[1] ?? null,
    kind: match(html, /<div class="pokemon-info">\s*카드 종류\s*:\s*([^<]*)/),
    illustrator: match(html, /<p class="illustrator">일러스트<br \/>([^<]*)/),
    attacks,
    weakness: stat("약점"),
    resistance: stat("저항력"),
    remoteImage: imgPath ? `${BASE}${imgPath}` : "",
    sourceUrl: `${BASE}/cards/detail/${cardNum}`,
  };
}

/** 이미지를 받아 webp 로 저장. 카드 원본이 868x1212(약 1.7MB)라 높이 700 으로 축소 */
async function download(url: string, dest: string, { trim = false } = {}) {
  if (existsSync(dest)) return false;
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`이미지 실패 ${res.status}: ${url}`);
  let img = sharp(Buffer.from(await res.arrayBuffer()));
  // 팩 이미지는 투명 여백이 커서 잘라냄
  img = trim ? img.trim() : img.resize({ height: 700, withoutEnlargement: true });
  await img.webp({ quality: 85 }).toFile(dest);
  return true;
}

async function main() {
  console.log(`▶ "${SET_NAME}" 수집 시작`);
  const list = await listCards();
  if (list.length === 0) throw new Error("카드를 찾지 못했습니다. 확장팩 이름을 확인하세요.");

  const cards: CardData[] = [];
  for (const [i, item] of list.entries()) {
    await sleep(DELAY_MS);
    const res = await fetch(`${BASE}/cards/detail/${item.CardNum}`, { headers: HEADERS });
    const { remoteImage, ...card } = parseDetail(await res.text(), item.CardNum);

    const dir = path.join("public", "cards", card.setCode);
    await mkdir(dir, { recursive: true });
    const file = `${card.number.split("/")[0] || item.CardNum}.webp`;
    const imageUrl = remoteImage.replace(/\?w=\d+$/, "");
    const fresh = imageUrl ? await download(imageUrl, path.join(dir, file)) : false;
    if (fresh) await sleep(DELAY_MS);

    cards.push({ ...card, image: `/cards/${card.setCode}/${file}` });
    console.log(`[${i + 1}/${list.length}] ${card.number} ${card.rarity.padEnd(3)} ${card.name}`);
  }

  const setCode = cards[0].setCode;
  if (PACK_URL) await download(PACK_URL, path.join("public", "cards", setCode, "pack.webp"), { trim: true });
  const out = path.join("src", "data", "cards", `${setCode}.json`);
  await mkdir(path.dirname(out), { recursive: true });
  await writeFile(out, JSON.stringify({ setName: SET_NAME, setCode, fetchedAt: new Date().toISOString(), cards }, null, 2));
  console.log(`✔ ${cards.length}장 저장 → ${out}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

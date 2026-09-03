/**
 * Oyun metninden senaryo cikarma (izomorfik, LLM'siz).
 *
 * KRITIK: `yanit` metni kaynaktan BIREBIR alinir. LLM kullanilmaz cunku modelin
 * tek kelime degistirmesi bile "senaryoya sadik kalma" garantisini bozar.
 * Sadece sahne yonergeleri ( ... ) [ ... ] temizlenir - TTS onlari okumasin diye.
 */
import type { LineInput } from "./schema";

export interface ScriptEntry {
  /** Konusan karakter; null = sahne yonergesi veya basliksiz metin */
  speaker: string | null;
  text: string;
  line: number;
  isStage: boolean;
}

export interface CharacterStat {
  name: string;
  count: number;
  chars: number;
}

export type ScriptFormat = "colon" | "caps" | "mixed" | "none";

export interface ParsedScript {
  entries: ScriptEntry[];
  characters: CharacterStat[];
  format: ScriptFormat;
  totalLines: number;
}

const TR_UPPER = "A-ZÇĞİIÖŞÜ";
const TR_LOWER = "a-zçğıöşü";

/** "KEMAL (sinirli):" -> "KEMAL" */
function cleanSpeaker(raw: string): string {
  return raw
    .replace(/\([^)]*\)/g, " ")
    .replace(/\[[^\]]*\]/g, " ")
    .replace(/[.:,;]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Sahne yonergelerini ve fazla bosluklari temizler (TTS okumasin) */
export function cleanDialogue(raw: string): string {
  return raw
    .replace(/\([^)]*\)/g, " ")
    .replace(/\[[^\]]*\]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isAllUpper(s: string): boolean {
  return !new RegExp(`[${TR_LOWER}]`).test(s) && new RegExp(`[${TR_UPPER}]`).test(s);
}

/** Iki nokta oncesi bir isim gibi mi duruyor? (kisa, cumle noktalamasi yok, en fazla 4 kelime) */
function looksLikeName(s: string): boolean {
  const t = s.trim();
  if (!t || t.length > 40) return false;
  if (/[.!?]/.test(t)) return false;
  if (t.split(/\s+/).length > 4) return false;
  return new RegExp(`^[${TR_UPPER}${TR_LOWER}0-9]`).test(t);
}

function isStageLine(s: string): boolean {
  const t = s.trim();
  return (t.startsWith("(") && t.endsWith(")")) || (t.startsWith("[") && t.endsWith("]"));
}

const HEADING_WORDS = [
  "SAHNE", "PERDE", "BÖLÜM", "BOLUM", "KISIM", "PROLOG", "EPİLOG", "EPILOG", "FİNAL", "FINAL",
  "SCENE", "ACT", "PART", "PROLOGUE", "EPILOGUE", "SON", "OYUN", "KİŞİLER", "KISILER", "KARAKTERLER",
];

/** "SAHNE 1", "PERDE II", "3." gibi basliklar konusmaci degildir */
function isSceneHeading(s: string): boolean {
  const t = s.replace(/[.:,;-]+$/g, "").trim();
  if (!t) return false;
  if (/^[0-9IVXLC]+$/i.test(t)) return true;
  const first = t.split(/\s+/)[0].toLocaleUpperCase("tr-TR");
  return HEADING_WORDS.includes(first);
}

/** Oyun metnini konusma bloklarina ayirir. Desteklenen bicimler:
 *  "KEMAL: replik"  |  "KEMAL:" + alt satir  |  ustu tamamen BUYUK HARF isim + alt satir
 */
export function parseScript(text: string): ParsedScript {
  const rawLines = text.replace(/\r\n?/g, "\n").split("\n");
  const entries: ScriptEntry[] = [];
  let colonHits = 0;
  let capsHits = 0;

  let current: ScriptEntry | null = null;
  const push = () => {
    if (!current) return;
    const cleaned = cleanDialogue(current.text);
    if (cleaned || current.isStage) entries.push({ ...current, text: cleaned || current.text.trim() });
    current = null;
  };

  const colonRe = new RegExp(`^\\s*([${TR_UPPER}${TR_LOWER}0-9][^:]{0,39}):\\s*(.*)$`);

  for (let i = 0; i < rawLines.length; i++) {
    const raw = rawLines[i];
    const trimmed = raw.trim();

    if (!trimmed) {
      push();
      continue;
    }

    if (isStageLine(trimmed)) {
      push();
      entries.push({ speaker: null, text: trimmed, line: i + 1, isStage: true });
      continue;
    }

    if (isSceneHeading(trimmed)) {
      push();
      entries.push({ speaker: null, text: trimmed, line: i + 1, isStage: true });
      continue;
    }

    const m = colonRe.exec(raw);
    if (m && looksLikeName(m[1])) {
      push();
      colonHits++;
      current = { speaker: cleanSpeaker(m[1]), text: m[2] ?? "", line: i + 1, isStage: false };
      continue;
    }

    // Kendi satirinda tamamen buyuk harf isim -> konusmaci basligi
    const bare = cleanSpeaker(trimmed);
    if (bare && bare.length <= 40 && isAllUpper(bare) && bare.split(/\s+/).length <= 4) {
      push();
      capsHits++;
      current = { speaker: bare, text: "", line: i + 1, isStage: false };
      continue;
    }

    if (current) {
      current.text += (current.text ? " " : "") + trimmed;
    } else {
      // Basliksiz paragraf (anlatim / sahne tarifi)
      entries.push({ speaker: null, text: trimmed, line: i + 1, isStage: false });
    }
  }
  push();

  const map = new Map<string, CharacterStat>();
  for (const e of entries) {
    if (!e.speaker || !e.text) continue;
    const key = e.speaker.toLocaleUpperCase("tr-TR");
    const stat = map.get(key) ?? { name: e.speaker, count: 0, chars: 0 };
    stat.count++;
    stat.chars += e.text.length;
    map.set(key, stat);
  }

  const format: ScriptFormat =
    colonHits && capsHits ? "mixed" : colonHits ? "colon" : capsHits ? "caps" : "none";

  return {
    entries,
    characters: Array.from(map.values()).sort((a, b) => b.count - a.count),
    format,
    totalLines: rawLines.length,
  };
}

export interface BuildOptions {
  /** Ust uste gelen AI replikleri tek replikte birlestir (varsayilan: acik) */
  mergeConsecutive?: boolean;
  /** Bu uzunlugun altindaki tetikleyiciler icin uyari uret */
  minCueChars?: number;
}

export interface BuildResult {
  replikler: LineInput[];
  warnings: string[];
  /** Tetikleyicisi olmayan replik siralari - operator BOSLUK ile tetikler */
  manualCues: number[];
}

/** Cozumlenmis metinden, secilen karakterin replik listesini uretir */
export function buildReplikler(
  parsed: ParsedScript,
  karakter: string,
  opts: BuildOptions = {}
): BuildResult {
  const merge = opts.mergeConsecutive !== false;
  const minCue = opts.minCueChars ?? 12;
  const target = karakter.toLocaleUpperCase("tr-TR").trim();

  const replikler: LineInput[] = [];
  const warnings: string[] = [];
  const manualCues: number[] = [];

  let pendingCue: string | null = null;
  let lastWasAi = false;
  let skippedStage = 0;

  for (const e of parsed.entries) {
    if (!e.text) continue;
    if (e.isStage || !e.speaker) {
      // Sahne yonergesi soylenmez -> tetikleyici olamaz; onceki replik cue olarak kalir
      if (e.isStage) skippedStage++;
      lastWasAi = false;
      continue;
    }

    const isAi = e.speaker.toLocaleUpperCase("tr-TR").trim() === target;
    if (!isAi) {
      pendingCue = e.text;
      lastWasAi = false;
      continue;
    }

    if (merge && lastWasAi && replikler.length) {
      const prev = replikler[replikler.length - 1];
      prev.yanit = `${prev.yanit} ${e.text}`.trim();
    } else {
      replikler.push({
        sira: replikler.length + 1,
        tetikleyici: pendingCue ?? "",
        yanit: e.text,
        esneklik: "dusuk",
      });
    }
    lastWasAi = true;
    pendingCue = null;
  }

  replikler.forEach((l, i) => {
    l.sira = i + 1;
    if (!l.tetikleyici) {
      manualCues.push(l.sira);
    } else if (l.tetikleyici.length < minCue) {
      warnings.push(`#${l.sira}: tetikleyici çok kısa ("${l.tetikleyici}") — sahnede güvenilmez, elle uzat.`);
    }
  });

  if (manualCues.length) {
    warnings.push(
      `Tetikleyicisi olmayan replik(ler): #${manualCues.join(", #")} — bunları operatör BOŞLUK tuşuyla tetikler ya da tetikleyiciyi elle yazarsın.`
    );
  }
  if (skippedStage) {
    warnings.push(`${skippedStage} sahne yönergesi tetikleyici sayılmadı (söylenmediği için).`);
  }
  if (merge) {
    const merged = replikler.filter((l) => l.yanit.length > 400).length;
    if (merged) warnings.push(`${merged} replik çok uzun — art arda gelen replikler birleştirilmiş olabilir, kontrol et.`);
  }

  return { replikler, warnings, manualCues };
}

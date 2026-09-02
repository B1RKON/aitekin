/**
 * DOOM showroom catalog
 * Koridor + 6 oda, her oda 2-3 arac sandigi (crate)
 */

export type ToolColor = "cyan" | "purple" | "green" | "pink";

export interface ShowroomTool {
  id: string;
  label: string;
  href: string;
  color: ToolColor;
  hexColor: string;
  iconChar: string;
  description: string;
  /** Oda indeksi (0-5) */
  roomIndex: number;
  /** Odadaki sandik slot indeksi (0-2) */
  slotIndex: number;
}

export const NEON_COLORS: Record<ToolColor, string> = {
  cyan: "#00FFE5",
  purple: "#BF40FF",
  green: "#39FF14",
  pink: "#FF0080",
};

// Koridor boyutlari
export const CORRIDOR_LENGTH = 54;
export const CORRIDOR_WIDTH = 6;
export const CORRIDOR_HEIGHT = 4;
export const ROOM_SIZE = 8;
export const ROOM_DEPTH = 8;

export interface RoomConfig {
  index: number;
  side: "left" | "right";
  z: number;
  x: number;
  accentColor: ToolColor;
  accentHex: string;
}

const ROOM_Z_POSITIONS = [-6, -18, -30];
const SIDE_X_OFFSET = CORRIDOR_WIDTH / 2 + ROOM_SIZE / 2;

export const SHOWROOM_ROOMS: RoomConfig[] = [
  { index: 0, side: "left",  z: ROOM_Z_POSITIONS[0], x: -SIDE_X_OFFSET, accentColor: "cyan",   accentHex: NEON_COLORS.cyan },
  { index: 1, side: "right", z: ROOM_Z_POSITIONS[0], x:  SIDE_X_OFFSET, accentColor: "purple", accentHex: NEON_COLORS.purple },
  { index: 2, side: "left",  z: ROOM_Z_POSITIONS[1], x: -SIDE_X_OFFSET, accentColor: "purple", accentHex: NEON_COLORS.purple },
  { index: 3, side: "right", z: ROOM_Z_POSITIONS[1], x:  SIDE_X_OFFSET, accentColor: "green",  accentHex: NEON_COLORS.green },
  { index: 4, side: "left",  z: ROOM_Z_POSITIONS[2], x: -SIDE_X_OFFSET, accentColor: "green",  accentHex: NEON_COLORS.green },
  { index: 5, side: "right", z: ROOM_Z_POSITIONS[2], x:  SIDE_X_OFFSET, accentColor: "pink",   accentHex: NEON_COLORS.pink },
];

export const SHOWROOM_TOOLS: ShowroomTool[] = [
  // Oda 0 - Video/Ses g1 (3 arac)
  { id: "video-converter",   label: "Video Dönüştürücü", href: "/dashboard/tools/video-converter",   color: "cyan",   hexColor: NEON_COLORS.cyan,   iconChar: "V", description: "MP4, WebM, AVI",           roomIndex: 0, slotIndex: 0 },
  { id: "audio-converter",   label: "Ses Dönüştürücü",   href: "/dashboard/tools/audio-converter",   color: "cyan",   hexColor: NEON_COLORS.cyan,   iconChar: "A", description: "MP3, WAV, FLAC",           roomIndex: 0, slotIndex: 1 },
  { id: "video-generator",   label: "Video Üretici",     href: "/dashboard/tools/video-generator",   color: "cyan",   hexColor: NEON_COLORS.cyan,   iconChar: "G", description: "Metinden video",           roomIndex: 0, slotIndex: 2 },

  // Oda 1 - Video/Ses g2 (2 arac)
  { id: "music-generator",   label: "Müzik Üretici",     href: "/dashboard/tools/music-generator",   color: "purple", hexColor: NEON_COLORS.purple, iconChar: "M", description: "AI müzik",                 roomIndex: 1, slotIndex: 0 },
  { id: "video-downloader",  label: "Video İndirici",    href: "/dashboard/tools/video-downloader",  color: "purple", hexColor: NEON_COLORS.purple, iconChar: "D", description: "YouTube, Twitter",        roomIndex: 1, slotIndex: 2 },

  // Oda 2 - Gorsel g1 (3 arac)
  { id: "image-tools",       label: "Görüntü İşleme",    href: "/dashboard/tools/image-tools",       color: "purple", hexColor: NEON_COLORS.purple, iconChar: "I", description: "Görüntü araçları",         roomIndex: 2, slotIndex: 0 },
  { id: "image-upscaler",    label: "Görsel Büyütücü",   href: "/dashboard/tools/image-upscaler",    color: "purple", hexColor: NEON_COLORS.purple, iconChar: "U", description: "Çözünürlük artır",         roomIndex: 2, slotIndex: 1 },
  { id: "ai-image-generator",label: "AI Görsel Üretici", href: "/dashboard/tools/ai-image-generator",color: "purple", hexColor: NEON_COLORS.purple, iconChar: "X", description: "SDXL, FLUX",              roomIndex: 2, slotIndex: 2 },

  // Oda 3 - Gorsel g2 (2 arac)
  { id: "photo-restore",     label: "Foto Onarıcı",      href: "/dashboard/tools/photo-restore",     color: "green",  hexColor: NEON_COLORS.green,  iconChar: "R", description: "Eski foto onarımı",        roomIndex: 3, slotIndex: 0 },
  { id: "object-remover",    label: "Arka Plan Kaldırıcı",href:"/dashboard/tools/object-remover",    color: "green",  hexColor: NEON_COLORS.green,  iconChar: "E", description: "Nesne/arka plan silme",    roomIndex: 3, slotIndex: 2 },

  // Oda 4 - Metin/AI g1 (2 arac)
  { id: "pdf-chat",          label: "PDF Sohbet",        href: "/dashboard/tools/pdf-chat",          color: "green",  hexColor: NEON_COLORS.green,  iconChar: "P", description: "PDF ile sohbet",           roomIndex: 4, slotIndex: 0 },
  { id: "ocr-solver",        label: "OCR Çözücü",        href: "/dashboard/tools/ocr-solver",        color: "green",  hexColor: NEON_COLORS.green,  iconChar: "O", description: "Görüntüden metin",         roomIndex: 4, slotIndex: 2 },

  // Oda 5 - Metin/AI g2 (2 arac)
  { id: "ai-chat",           label: "AI Sohbet",         href: "/dashboard/tools/ai-chat",           color: "pink",   hexColor: NEON_COLORS.pink,   iconChar: "C", description: "Llama, GPT-OSS",           roomIndex: 5, slotIndex: 0 },
  { id: "text-summarizer",   label: "Metin Özetleme",    href: "/dashboard/tools/text-summarizer",   color: "pink",   hexColor: NEON_COLORS.pink,   iconChar: "S", description: "Uzun metin özetle",        roomIndex: 5, slotIndex: 2 },
  { id: "tiyatro-ai",        label: "Tiyatro AI",        href: "/dashboard/tools/tiyatro-ai",        color: "pink",   hexColor: NEON_COLORS.pink,   iconChar: "T", description: "Sahnede AI karakter",      roomIndex: 5, slotIndex: 1 },
];

/**
 * Oda icindeki 3 slot pozisyonu (oda merkezine gore lokal)
 */
export function getSlotLocalPosition(slotIndex: number): [number, number, number] {
  const slotSpacing = 2.4;
  const backZOffset = -ROOM_DEPTH / 2 + 1.8;
  const xOffset = (slotIndex - 1) * slotSpacing;
  return [xOffset, 0, backZOffset];
}

/**
 * Stand/sandik'in dunya (global) pozisyonu
 */
export function getStandWorldPosition(tool: ShowroomTool): [number, number, number] {
  const room = SHOWROOM_ROOMS[tool.roomIndex];
  const [localX, localY, localZ] = getSlotLocalPosition(tool.slotIndex);
  const xInWorld = room.x + (room.side === "left" ? -localX : localX);
  return [xInWorld, localY, room.z + localZ];
}

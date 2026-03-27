const YOUTUBE_REGEX =
  /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|m\.youtube\.com|youtube-nocookie\.com)\/.+/i;

export function isYouTubeUrl(url: string): boolean {
  return YOUTUBE_REGEX.test(url.trim());
}

export type Platform = "youtube" | "other";

export function detectPlatform(url: string): Platform {
  return isYouTubeUrl(url) ? "youtube" : "other";
}

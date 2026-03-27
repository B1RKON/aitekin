"use client";

import { useState, useCallback } from "react";
import { detectPlatform, type Platform } from "@/lib/video/detect-platform";

export interface VideoFormat {
  itag: number;
  quality: string;
  type: "muxed" | "video" | "audio";
  container: string;
  hasAudio: boolean;
  hasVideo: boolean;
  contentLength: string | null;
  url: string;
}

export interface VideoInfo {
  title: string;
  thumbnail: string;
  duration: string;
  channel: string;
  viewCount: string;
  formats: VideoFormat[];
}

interface CobaltResponse {
  status?: string;
  url?: string;
  error?: { code: string; context?: { message?: string } } | string;
}

type DownloadMode = "auto" | "audio" | "mute";

interface UseVideoDownloaderReturn {
  url: string;
  setUrl: (url: string) => void;
  platform: Platform | null;
  loading: boolean;
  error: string | null;
  videoInfo: VideoInfo | null;
  selectedFormat: VideoFormat | null;
  setSelectedFormat: (format: VideoFormat | null) => void;
  downloading: boolean;
  cobaltQuality: string;
  setCobaltQuality: (q: string) => void;
  cobaltMode: DownloadMode;
  setCobaltMode: (m: DownloadMode) => void;
  fetchInfo: () => Promise<void>;
  download: () => Promise<void>;
  reset: () => void;
}

export function useVideoDownloader(): UseVideoDownloaderReturn {
  const [url, setUrl] = useState("");
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<VideoFormat | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [cobaltQuality, setCobaltQuality] = useState("1080");
  const [cobaltMode, setCobaltMode] = useState<DownloadMode>("auto");

  const reset = useCallback(() => {
    setVideoInfo(null);
    setSelectedFormat(null);
    setError(null);
    setPlatform(null);
    setLoading(false);
    setDownloading(false);
  }, []);

  const fetchInfo = useCallback(async () => {
    const trimmed = url.trim();
    if (!trimmed) {
      setError("Lütfen bir URL girin");
      return;
    }

    setLoading(true);
    setError(null);
    setVideoInfo(null);
    setSelectedFormat(null);

    const detected = detectPlatform(trimmed);
    setPlatform(detected);

    if (detected === "youtube") {
      try {
        const res = await fetch("/api/youtube", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: trimmed }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "YouTube hatası oluştu");
          return;
        }

        setVideoInfo(data);
        // Varsayilan olarak ilk muxed formati sec
        const muxed = data.formats.find(
          (f: VideoFormat) => f.type === "muxed"
        );
        if (muxed) setSelectedFormat(muxed);
      } catch {
        setError("Bağlantı hatası. Lütfen tekrar deneyin.");
      }
    }
    // Cobalt platformlari icin bilgi alma yok - dogrudan indirme
    setLoading(false);
  }, [url]);

  const download = useCallback(async () => {
    const trimmed = url.trim();
    if (!trimmed) return;

    setDownloading(true);
    setError(null);

    try {
      if (platform === "youtube" && selectedFormat) {
        // Oncelik: dogrudan CDN URL
        if (selectedFormat.url) {
          window.open(selectedFormat.url, "_blank");
        } else {
          // Yedek: proxy uzerinden stream
          const downloadUrl = `/api/youtube/download?url=${encodeURIComponent(trimmed)}&itag=${selectedFormat.itag}`;
          window.open(downloadUrl, "_blank");
        }
      } else {
        // Cobalt API
        const res = await fetch("/api/download", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: trimmed,
            videoQuality: cobaltQuality,
            downloadMode: cobaltMode,
            audioFormat: "mp3",
            audioBitrate: "128",
          }),
        });

        const data: CobaltResponse = await res.json();

        if (!res.ok || data.status === "error") {
          const errMsg =
            typeof data.error === "string"
              ? data.error
              : data.error?.context?.message || "İndirme hatası oluştu";
          setError(errMsg);
          return;
        }

        if (data.url) {
          window.open(data.url, "_blank");
        } else {
          setError("İndirme linki alınamadı");
        }
      }
    } catch {
      setError("İndirme sırasında hata oluştu");
    } finally {
      setDownloading(false);
    }
  }, [url, platform, selectedFormat, cobaltQuality, cobaltMode]);

  return {
    url,
    setUrl,
    platform,
    loading,
    error,
    videoInfo,
    selectedFormat,
    setSelectedFormat,
    downloading,
    cobaltQuality,
    setCobaltQuality,
    cobaltMode,
    setCobaltMode,
    fetchInfo,
    download,
    reset,
  };
}

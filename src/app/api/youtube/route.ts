import { NextRequest, NextResponse } from "next/server";
import ytdl from "@distube/ytdl-core";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || !ytdl.validateURL(url)) {
      return NextResponse.json(
        { error: "Geçerli bir YouTube URL'si girin" },
        { status: 400 }
      );
    }

    const info = await ytdl.getInfo(url);
    const { videoDetails } = info;

    const durationSec = parseInt(videoDetails.lengthSeconds, 10);
    const minutes = Math.floor(durationSec / 60);
    const seconds = durationSec % 60;
    const duration = `${minutes}:${seconds.toString().padStart(2, "0")}`;

    // Muxed formats (video + audio together) - en guvenilir
    const muxedFormats = info.formats
      .filter((f) => f.hasVideo && f.hasAudio && f.container === "mp4")
      .map((f) => ({
        itag: f.itag,
        quality: f.qualityLabel || "unknown",
        type: "muxed" as const,
        container: f.container || "mp4",
        hasAudio: true,
        hasVideo: true,
        contentLength: f.contentLength || null,
        url: f.url,
      }))
      // Kaliteye gore sirala, yuksek kalite once
      .sort((a, b) => {
        const aH = parseInt(a.quality) || 0;
        const bH = parseInt(b.quality) || 0;
        return bH - aH;
      })
      // Ayni kalitede tekrari onle
      .filter(
        (f, i, arr) => arr.findIndex((x) => x.quality === f.quality) === i
      );

    // Video-only formats (daha yuksek kalite)
    const videoFormats = info.formats
      .filter(
        (f) =>
          f.hasVideo &&
          !f.hasAudio &&
          f.container === "mp4" &&
          f.qualityLabel
      )
      .map((f) => ({
        itag: f.itag,
        quality: f.qualityLabel || "unknown",
        type: "video" as const,
        container: f.container || "mp4",
        hasAudio: false,
        hasVideo: true,
        contentLength: f.contentLength || null,
        url: f.url,
      }))
      .sort((a, b) => {
        const aH = parseInt(a.quality) || 0;
        const bH = parseInt(b.quality) || 0;
        return bH - aH;
      })
      .filter(
        (f, i, arr) => arr.findIndex((x) => x.quality === f.quality) === i
      );

    // Audio-only formats
    const audioFormats = info.formats
      .filter((f) => f.hasAudio && !f.hasVideo)
      .map((f) => ({
        itag: f.itag,
        quality: f.audioBitrate ? `${f.audioBitrate}kbps` : "unknown",
        type: "audio" as const,
        container: f.container || "mp4",
        hasAudio: true,
        hasVideo: false,
        contentLength: f.contentLength || null,
        url: f.url,
      }))
      .sort((a, b) => {
        const aB = parseInt(a.quality) || 0;
        const bB = parseInt(b.quality) || 0;
        return bB - aB;
      })
      .filter(
        (f, i, arr) => arr.findIndex((x) => x.quality === f.quality) === i
      );

    return NextResponse.json({
      title: videoDetails.title,
      thumbnail:
        videoDetails.thumbnails[videoDetails.thumbnails.length - 1]?.url || "",
      duration,
      channel: videoDetails.author.name,
      viewCount: videoDetails.viewCount,
      formats: [...muxedFormats, ...videoFormats, ...audioFormats],
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Bilinmeyen hata oluştu";

    if (message.includes("private video")) {
      return NextResponse.json(
        { error: "Bu video özel (private), indirilemez." },
        { status: 403 }
      );
    }
    if (message.includes("age")) {
      return NextResponse.json(
        { error: "Bu video yaş kısıtlamalı, indirilemez." },
        { status: 403 }
      );
    }
    if (message.includes("unavailable")) {
      return NextResponse.json(
        { error: "Bu video kullanılamıyor veya bölgenizde engellenmiş." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: `YouTube hatası: ${message}` },
      { status: 500 }
    );
  }
}

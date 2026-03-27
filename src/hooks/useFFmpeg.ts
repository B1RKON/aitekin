"use client";

import { useState, useRef, useCallback } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL, fetchFile } from "@ffmpeg/util";

export interface ConversionProgress {
  progress: number;
  time: number;
}

export function useFFmpeg() {
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<ConversionProgress>({ progress: 0, time: 0 });
  const [converting, setConverting] = useState(false);

  const load = useCallback(async () => {
    if (loaded || loading) return;
    setLoading(true);

    try {
      const ffmpeg = new FFmpeg();
      ffmpegRef.current = ffmpeg;

      ffmpeg.on("progress", ({ progress, time }) => {
        setProgress({ progress: Math.round(progress * 100), time });
      });

      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";

      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
      });

      setLoaded(true);
    } catch (error) {
      console.error("FFmpeg yukleme hatasi:", error);
    } finally {
      setLoading(false);
    }
  }, [loaded, loading]);

  const convertFile = useCallback(
    async (
      inputFile: File,
      outputFormat: string,
      options: string[] = []
    ): Promise<Blob | null> => {
      const ffmpeg = ffmpegRef.current;
      if (!ffmpeg || !loaded) return null;

      setConverting(true);
      setProgress({ progress: 0, time: 0 });

      try {
        const inputName = `input.${inputFile.name.split(".").pop()}`;
        const outputName = `output.${outputFormat}`;

        await ffmpeg.writeFile(inputName, await fetchFile(inputFile));
        await ffmpeg.exec(["-i", inputName, ...options, outputName]);

        const data = await ffmpeg.readFile(outputName);
        const blob = new Blob([new Uint8Array(data as Uint8Array)], { type: getMimeType(outputFormat) });

        await ffmpeg.deleteFile(inputName);
        await ffmpeg.deleteFile(outputName);

        return blob;
      } catch (error) {
        console.error("Donusum hatasi:", error);
        return null;
      } finally {
        setConverting(false);
      }
    },
    [loaded]
  );

  const extractAudio = useCallback(
    async (inputFile: File, audioFormat: string = "mp3"): Promise<Blob | null> => {
      return convertFile(inputFile, audioFormat, ["-vn", "-acodec", getAudioCodec(audioFormat)]);
    },
    [convertFile]
  );

  return { load, loaded, loading, converting, progress, convertFile, extractAudio };
}

function getMimeType(format: string): string {
  const types: Record<string, string> = {
    mp4: "video/mp4",
    webm: "video/webm",
    avi: "video/x-msvideo",
    mov: "video/quicktime",
    mkv: "video/x-matroska",
    mp3: "audio/mpeg",
    wav: "audio/wav",
    aac: "audio/aac",
    flac: "audio/flac",
    ogg: "audio/ogg",
    gif: "image/gif",
  };
  return types[format] || "application/octet-stream";
}

function getAudioCodec(format: string): string {
  const codecs: Record<string, string> = {
    mp3: "libmp3lame",
    aac: "aac",
    wav: "pcm_s16le",
    flac: "flac",
    ogg: "libvorbis",
  };
  return codecs[format] || "copy";
}

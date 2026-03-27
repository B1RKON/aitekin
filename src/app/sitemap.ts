import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://aitekin.com";

  const tools = [
    "video-converter",
    "audio-converter",
    "video-generator",
    "music-generator",
    "image-tools",
    "image-upscaler",
    "photo-restore",
    "ai-image-generator",
    "object-remover",
    "pdf-chat",
    "ai-chat",
    "ocr-solver",
    "text-summarizer",
    "video-downloader",
  ];

  const games = ["retro-emulator", "html5-games", "pixel-art"];

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/register`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/dashboard`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/ai-rehberi`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    ...tools.map((tool) => ({
      url: `${baseUrl}/dashboard/tools/${tool}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...games.map((game) => ({
      url: `${baseUrl}/dashboard/games/${game}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}

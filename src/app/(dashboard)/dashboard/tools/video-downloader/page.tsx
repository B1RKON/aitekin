"use client";

import { Info, Download, Clipboard, RotateCcw, Music, Video, VolumeX, AlertTriangle } from "lucide-react";
import GlowCard from "@/components/ui/GlowCard";
import TerminalCard from "@/components/ui/TerminalCard";
import NeonButton from "@/components/ui/NeonButton";
import { useVideoDownloader, type VideoFormat } from "@/hooks/useVideoDownloader";

const platforms = [
  { name: "YouTube", color: "text-red-500" },
  { name: "Instagram", color: "text-pink-500" },
  { name: "TikTok", color: "text-text-primary" },
  { name: "Twitter/X", color: "text-blue-400" },
  { name: "Facebook", color: "text-blue-600" },
  { name: "Reddit", color: "text-orange-500" },
  { name: "SoundCloud", color: "text-orange-400" },
  { name: "Vimeo", color: "text-cyan-400" },
  { name: "Pinterest", color: "text-red-600" },
  { name: "Dailymotion", color: "text-blue-300" },
  { name: "Twitch", color: "text-purple-400" },
  { name: "Tumblr", color: "text-blue-400" },
];

const cobaltQualities = ["360", "480", "720", "1080", "1440", "2160"];

function formatBytes(bytes: string | null): string {
  if (!bytes) return "";
  const b = parseInt(bytes, 10);
  if (isNaN(b)) return "";
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

export default function VideoDownloaderPage() {
  const {
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
  } = useVideoDownloader();

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
    } catch {
      // clipboard izni yoksa yoksay
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchInfo();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">
          <span className="text-neon-green">{">"} </span>
          <span className="text-text-primary">Sosyal Medya Video İndirici</span>
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          YouTube, Instagram, TikTok, Twitter ve daha fazlasından video ve ses indir. Ücretsiz, reklamsız.
        </p>
      </div>

      {/* Info Box */}
      <GlowCard>
        <div className="flex gap-3">
          <Info className="text-neon-green shrink-0 mt-0.5" size={18} />
          <div>
            <h3 className="text-neon-green font-bold text-sm mb-2">Nasıl Kullanılır?</h3>
            <ol className="text-text-secondary text-sm space-y-1 list-decimal list-inside">
              <li>İndirmek istediğin videonun linkini kopyala</li>
              <li>Aşağıdaki alana yapıştır</li>
              <li>YouTube ise kalite seç, diğer platformlar için mod ve kalite ayarla</li>
              <li>İndir butonuna tıkla</li>
            </ol>
          </div>
        </div>
      </GlowCard>

      {/* Supported Platforms */}
      <div className="flex flex-wrap gap-2">
        {platforms.map((p) => (
          <span
            key={p.name}
            className={`px-3 py-1 rounded-full bg-base-200 border border-base-300 text-xs font-mono ${p.color}`}
          >
            {p.name}
          </span>
        ))}
      </div>

      {/* Main Downloader */}
      <TerminalCard title="tools/video-downloader">
        <div className="space-y-4">
          {/* URL Input */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (videoInfo) reset();
                }}
                placeholder="Video URL yapıştır... (YouTube, Instagram, TikTok, vb.)"
                className="w-full bg-base-100 border border-base-300 rounded-lg px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/50 font-mono focus:outline-none focus:border-neon-green/50 transition-colors"
              />
              <button
                type="button"
                onClick={handlePaste}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-text-secondary hover:text-neon-cyan transition-colors"
                title="Yapıştır"
              >
                <Clipboard size={16} />
              </button>
            </div>
            <NeonButton
              type="submit"
              color="green"
              size="md"
              disabled={loading || !url.trim()}
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-neon-green/30 border-t-neon-green rounded-full animate-spin" />
              ) : (
                "Ara"
              )}
            </NeonButton>
          </form>

          {/* Platform Badge */}
          {platform && (
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-xs font-mono ${
                platform === "youtube"
                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                  : "bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30"
              }`}>
                {platform === "youtube" ? "YouTube (Direct)" : "Cobalt API"}
              </span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <AlertTriangle className="text-red-400 shrink-0 mt-0.5" size={16} />
              <p className="text-red-400 text-sm font-mono">{error}</p>
            </div>
          )}

          {/* YouTube Results */}
          {videoInfo && platform === "youtube" && (
            <div className="space-y-4">
              {/* Video Preview */}
              <div className="flex gap-4 bg-base-100 rounded-lg p-3">
                <div className="shrink-0 w-40 h-24 rounded overflow-hidden bg-base-300">
                  {videoInfo.thumbnail && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={videoInfo.thumbnail}
                      alt={videoInfo.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-text-primary text-sm font-bold truncate">
                    {videoInfo.title}
                  </h4>
                  <p className="text-text-secondary text-xs mt-1">{videoInfo.channel}</p>
                  <div className="flex gap-3 mt-2 text-xs text-text-secondary">
                    <span>{videoInfo.duration}</span>
                    {videoInfo.viewCount && (
                      <span>{parseInt(videoInfo.viewCount).toLocaleString("tr-TR")} izlenme</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Format Selection */}
              <div>
                <p className="text-text-secondary text-xs mb-2 uppercase tracking-wider">Video + Ses (MP4)</p>
                <div className="flex flex-wrap gap-2">
                  {videoInfo.formats
                    .filter((f) => f.type === "muxed")
                    .map((f) => (
                      <FormatPill
                        key={f.itag}
                        format={f}
                        selected={selectedFormat?.itag === f.itag}
                        onClick={() => setSelectedFormat(f)}
                      />
                    ))}
                </div>
              </div>

              {videoInfo.formats.some((f) => f.type === "video") && (
                <div>
                  <p className="text-text-secondary text-xs mb-2 uppercase tracking-wider">Sadece Video (Sessiz)</p>
                  <div className="flex flex-wrap gap-2">
                    {videoInfo.formats
                      .filter((f) => f.type === "video")
                      .map((f) => (
                        <FormatPill
                          key={f.itag}
                          format={f}
                          selected={selectedFormat?.itag === f.itag}
                          onClick={() => setSelectedFormat(f)}
                        />
                      ))}
                  </div>
                </div>
              )}

              {videoInfo.formats.some((f) => f.type === "audio") && (
                <div>
                  <p className="text-text-secondary text-xs mb-2 uppercase tracking-wider">Sadece Ses</p>
                  <div className="flex flex-wrap gap-2">
                    {videoInfo.formats
                      .filter((f) => f.type === "audio")
                      .map((f) => (
                        <FormatPill
                          key={f.itag}
                          format={f}
                          selected={selectedFormat?.itag === f.itag}
                          onClick={() => setSelectedFormat(f)}
                          isAudio
                        />
                      ))}
                  </div>
                </div>
              )}

              {/* Download Button */}
              <div className="flex gap-2">
                <NeonButton
                  color="cyan"
                  size="lg"
                  onClick={download}
                  disabled={!selectedFormat || downloading}
                  className="flex-1"
                >
                  {downloading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="inline-block w-4 h-4 border-2 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin" />
                      İndiriliyor...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Download size={18} />
                      İndir {selectedFormat ? `(${selectedFormat.quality})` : ""}
                    </span>
                  )}
                </NeonButton>
                <NeonButton color="purple" size="lg" variant="outline" onClick={reset}>
                  <RotateCcw size={18} />
                </NeonButton>
              </div>
            </div>
          )}

          {/* Cobalt (Non-YouTube) Controls */}
          {platform === "other" && !loading && (
            <div className="space-y-4">
              {/* Mode Selection */}
              <div>
                <p className="text-text-secondary text-xs mb-2 uppercase tracking-wider">İndirme Modu</p>
                <div className="flex gap-2">
                  {([
                    { value: "auto", label: "Video", icon: Video },
                    { value: "audio", label: "Sadece Ses", icon: Music },
                    { value: "mute", label: "Sessiz Video", icon: VolumeX },
                  ] as const).map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => setCobaltMode(value)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-mono transition-all ${
                        cobaltMode === value
                          ? "border-neon-cyan text-neon-cyan bg-neon-cyan/10"
                          : "border-base-300 text-text-secondary hover:border-text-secondary"
                      }`}
                    >
                      <Icon size={14} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quality Selection */}
              <div>
                <p className="text-text-secondary text-xs mb-2 uppercase tracking-wider">Kalite</p>
                <div className="flex flex-wrap gap-2">
                  {cobaltQualities.map((q) => (
                    <button
                      key={q}
                      onClick={() => setCobaltQuality(q)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${
                        cobaltQuality === q
                          ? "border-neon-green text-neon-green bg-neon-green/10"
                          : "border-base-300 text-text-secondary hover:border-text-secondary"
                      }`}
                    >
                      {q === "2160" ? "4K" : `${q}p`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Download Button */}
              <NeonButton
                color="cyan"
                size="lg"
                onClick={download}
                disabled={downloading}
                className="w-full"
              >
                {downloading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin" />
                    İndiriliyor...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Download size={18} />
                    İndir
                  </span>
                )}
              </NeonButton>
            </div>
          )}
        </div>
      </TerminalCard>

      {/* Privacy Notice */}
      <div className="bg-base-200/50 rounded-xl p-4 text-xs text-text-secondary">
        <strong className="text-neon-green">Gizlilik: </strong>
        YouTube indirmeleri doğrudan YouTube CDN üzerinden yapılır. Diğer platformlar açık kaynak Cobalt servisi üzerinden işlenir. Hiçbir kişisel veri saklanmaz.
      </div>
    </div>
  );
}

function FormatPill({
  format,
  selected,
  onClick,
  isAudio = false,
}: {
  format: VideoFormat;
  selected: boolean;
  onClick: () => void;
  isAudio?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${
        selected
          ? "border-neon-cyan text-neon-cyan bg-neon-cyan/10 shadow-[0_0_10px_rgba(0,255,229,0.2)]"
          : "border-base-300 text-text-secondary hover:border-text-secondary"
      }`}
    >
      {isAudio ? <Music size={12} /> : <Video size={12} />}
      <span className="font-bold">{format.quality}</span>
      {format.contentLength && (
        <span className="text-text-secondary/60">({formatBytes(format.contentLength)})</span>
      )}
    </button>
  );
}

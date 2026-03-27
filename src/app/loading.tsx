export default function Loading() {
  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block w-8 h-8 border-2 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin mb-4" />
        <p className="text-text-secondary text-sm font-mono animate-pulse">{"Yükleniyor..."}</p>
      </div>
    </div>
  );
}

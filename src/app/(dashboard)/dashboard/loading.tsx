export default function DashboardLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="font-mono text-neon-cyan text-sm mb-4 animate-pulse">
          {"$ loading module..."}
        </div>
        <div className="inline-block w-6 h-6 border-2 border-neon-green/30 border-t-neon-green rounded-full animate-spin" />
      </div>
    </div>
  );
}

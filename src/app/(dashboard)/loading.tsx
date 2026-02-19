export default function DashboardLoading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 h-full">
      <div
        className="w-12 h-12 rounded-full border-2 border-surveillance-cyan/20 border-t-surveillance-cyan animate-spin"
      />
      <p className="font-mono text-xs text-surveillance-cyan/40 tracking-widest animate-pulse">
        LOADING SECURE INTERFACE...
      </p>
    </div>
  );
}
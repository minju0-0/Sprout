export function AuthDivider({ label = "or continue with" }: { label?: string }) {
  return (
    <div className="flex items-center gap-4" role="separator">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent to-moss/20" />
      <span className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-soft/70">
        {label}
      </span>
      <div className="h-px flex-1 bg-gradient-to-l from-transparent to-moss/20" />
    </div>
  );
}
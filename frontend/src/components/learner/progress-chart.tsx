interface Props { progress: number; label: string }

export function ProgressChart({ progress, label }: Props) {
  return (
    <div className="rounded-lg border p-4" data-testid="progress-chart">
      <p className="mb-2 text-sm font-medium text-muted-foreground">{label}</p>
      <div className="flex items-center gap-4">
        <div className="h-3 flex-1 rounded-full bg-secondary">
          <div className="h-3 rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>
        <span className="text-lg font-bold">{Math.round(progress)}%</span>
      </div>
    </div>
  );
}

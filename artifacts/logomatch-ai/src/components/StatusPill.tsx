import { cn } from "@/lib/utils";

type StatusPillProps = {
  label: string;
  variant?: "idle" | "active" | "warning" | "danger";
  className?: string;
};

const variantStyles: Record<NonNullable<StatusPillProps["variant"]>, string> = {
  idle: "bg-white/5 text-foreground/80 border-white/10",
  active: "bg-primary/10 text-primary border-primary/30",
  warning: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  danger: "bg-destructive/10 text-destructive border-destructive/30",
};

const dotStyles: Record<NonNullable<StatusPillProps["variant"]>, string> = {
  idle: "bg-foreground/40",
  active: "bg-primary",
  warning: "bg-amber-400",
  danger: "bg-destructive",
};

export function StatusPill({ label, variant = "idle", className }: StatusPillProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium",
        variantStyles[variant],
        className,
      )}
    >
      <span className="relative flex h-2 w-2">
        <span
          className={cn(
            "animate-ping absolute inline-flex h-full w-full rounded-full opacity-60",
            dotStyles[variant],
          )}
        />
        <span className={cn("relative inline-flex rounded-full h-2 w-2", dotStyles[variant])} />
      </span>
      {label}
    </div>
  );
}

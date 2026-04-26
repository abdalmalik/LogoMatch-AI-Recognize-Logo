import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type MetricCardProps = {
  label: string;
  value: string | number;
  icon: ReactNode;
  accent?: "blue" | "purple";
  hint?: string;
};

export function MetricCard({ label, value, icon, accent = "blue", hint }: MetricCardProps) {
  const isBlue = accent === "blue";
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className={cn(
        "relative overflow-hidden rounded-xl glass-card p-5 group cursor-default transition-shadow",
        isBlue
          ? "hover:shadow-[0_0_30px_rgba(59,130,246,0.35)]"
          : "hover:shadow-[0_0_30px_rgba(168,85,247,0.35)]",
      )}
    >
      <div
        className={cn(
          "absolute -top-12 -right-12 h-32 w-32 rounded-full blur-3xl opacity-30 group-hover:opacity-60 transition-opacity",
          isBlue ? "bg-primary" : "bg-accent",
        )}
      />
      <div className="relative flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            {label}
          </p>
          <p className="text-3xl font-semibold tracking-tight">{value}</p>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
        <div
          className={cn(
            "h-10 w-10 rounded-lg flex items-center justify-center border",
            isBlue
              ? "bg-primary/10 text-primary border-primary/30"
              : "bg-accent/10 text-accent border-accent/30",
          )}
        >
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { StatusPill } from "./StatusPill";

type ResultCardProps = {
  companyName?: string;
  confidence?: number;
  placeholder?: boolean;
};

export function ResultCard({ companyName, confidence, placeholder = false }: ResultCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl p-6 relative overflow-hidden"
    >
      <div className="absolute -top-16 -right-16 h-40 w-40 bg-accent/30 rounded-full blur-3xl" />
      <div className="absolute -bottom-16 -left-16 h-40 w-40 bg-primary/30 rounded-full blur-3xl" />
      <div className="relative space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Recognition Result
          </div>
          <StatusPill
            label={placeholder ? "Awaiting Image" : "Match Found"}
            variant={placeholder ? "warning" : "active"}
          />
        </div>

        {placeholder ? (
          <div className="space-y-3 py-4">
            <div className="h-7 w-2/3 rounded bg-white/5 animate-pulse" />
            <div className="h-4 w-1/3 rounded bg-white/5 animate-pulse" />
            <p className="text-xs text-muted-foreground pt-3 leading-relaxed">
              Predictions will appear here after you upload a test logo.
              The backend compares the test embedding against stored company
              prototypes and returns the nearest matches.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground">Predicted Company</p>
              <p className="text-2xl font-semibold mt-1">{companyName}</p>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-muted-foreground">Confidence</span>
                <span className="font-mono text-primary">
                  {((confidence ?? 0) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent"
                  style={{ width: `${(confidence ?? 0) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

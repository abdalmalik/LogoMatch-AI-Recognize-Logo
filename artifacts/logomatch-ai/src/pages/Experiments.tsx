import { motion } from "framer-motion";
import { FlaskConical, Plus } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StatusPill } from "@/components/StatusPill";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const PLACEHOLDER_RUNS = [
  {
    name: "proto-net-v1",
    model: "Prototypical Networks",
    accuracy: "—",
    status: "Pending",
    date: "Awaiting backend",
  },
  {
    name: "siamese-baseline",
    model: "Siamese Networks",
    accuracy: "—",
    status: "Pending",
    date: "Awaiting backend",
  },
  {
    name: "clip-knn-zero-shot",
    model: "Image Similarity (CLIP)",
    accuracy: "—",
    status: "Pending",
    date: "Awaiting backend",
  },
  {
    name: "dinov2-knn-zero-shot",
    model: "Image Similarity (DINOv2)",
    accuracy: "—",
    status: "Pending",
    date: "Awaiting backend",
  },
];

export default function Experiments() {
  return (
    <div>
      <PageHeader
        title="Experiments"
        subtitle="Track every training run, compare architectures, and pick the best checkpoint."
        action={
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-block">
                  <Button
                    disabled
                    className="bg-gradient-to-r from-primary to-accent text-white opacity-60 cursor-not-allowed gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    New Experiment
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>Coming Soon — unlocks in Phase 2</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        }
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-xl overflow-hidden"
      >
        <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 border-b border-white/5 text-[10px] uppercase tracking-widest text-muted-foreground font-medium bg-white/[0.02]">
          <div className="col-span-3">Run</div>
          <div className="col-span-3">Model</div>
          <div className="col-span-2">Accuracy</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Date</div>
        </div>

        <div className="divide-y divide-white/5">
          {PLACEHOLDER_RUNS.map((run, i) => (
            <motion.div
              key={run.name}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="px-5 py-4 grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 md:items-center hover:bg-white/[0.02] transition-colors"
            >
              <div className="md:col-span-3 flex items-center gap-3">
                <div className="h-8 w-8 rounded-md bg-primary/10 border border-primary/30 text-primary flex items-center justify-center">
                  <FlaskConical className="h-4 w-4" />
                </div>
                <span className="font-mono text-sm">{run.name}</span>
              </div>
              <div className="md:col-span-3 text-sm text-muted-foreground">
                {run.model}
              </div>
              <div className="md:col-span-2 font-mono text-sm text-muted-foreground">
                {run.accuracy}
              </div>
              <div className="md:col-span-2">
                <StatusPill label={run.status} variant="warning" />
              </div>
              <div className="md:col-span-2 text-xs text-muted-foreground">
                {run.date}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="px-5 py-4 border-t border-white/5 bg-white/[0.02] text-xs text-muted-foreground">
          Experiment tracking is read-only in Phase 1. Real metrics, charts, and
          checkpoints arrive once the FastAPI backend and few-shot model are wired in.
        </div>
      </motion.div>
    </div>
  );
}

import { motion } from "framer-motion";
import { Brain, Network, Layers, Terminal, Cpu } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StatusPill } from "@/components/StatusPill";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const ARCHITECTURES = [
  {
    icon: Network,
    name: "Prototypical Networks",
    description:
      "Compute a class prototype as the mean embedding of the support set. Test images are classified by nearest prototype in embedding space.",
    paper: "Snell et al. 2017",
    accent: "blue" as const,
  },
  {
    icon: Brain,
    name: "Siamese Networks",
    description:
      "Twin encoders share weights and learn an embedding where similar logos are close. Inference compares pairs by cosine distance.",
    paper: "Koch et al. 2015",
    accent: "purple" as const,
  },
  {
    icon: Layers,
    name: "Image Similarity (Embeddings)",
    description:
      "Use a pretrained vision backbone (e.g. CLIP / DINOv2) to extract embeddings, then perform nearest-neighbor matching. Zero-training baseline.",
    paper: "Pretrained baseline",
    accent: "blue" as const,
  },
];

const LOG_LINES = [
  "[boot] LogoMatch runtime initialized",
  "[backend] FastAPI bridge: NOT CONNECTED",
  "[model] No checkpoint loaded",
  "[device] cpu=available · gpu=pending",
  "[status] waiting for Phase 2 — training enabled once backend is wired",
];

export default function ModelLab() {
  return (
    <div>
      <PageHeader
        title="Model Lab"
        subtitle="Choose an architecture, configure a run, and train your few-shot logo recognizer."
        action={<StatusPill label="Engine: Idle" variant="warning" />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {ARCHITECTURES.map((a, i) => {
          const Icon = a.icon;
          const isBlue = a.accent === "blue";
          return (
            <motion.div
              key={a.name}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -4 }}
              className={`glass-card rounded-xl p-6 relative overflow-hidden ${
                isBlue
                  ? "hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]"
                  : "hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]"
              } transition-shadow`}
            >
              <div
                className={`absolute -top-12 -right-12 h-32 w-32 rounded-full blur-3xl opacity-30 ${
                  isBlue ? "bg-primary" : "bg-accent"
                }`}
              />
              <div className="relative space-y-4">
                <div className="flex items-start justify-between">
                  <div
                    className={`h-10 w-10 rounded-lg flex items-center justify-center border ${
                      isBlue
                        ? "bg-primary/10 text-primary border-primary/30"
                        : "bg-accent/10 text-accent border-accent/30"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <StatusPill label="Coming Soon" variant="warning" />
                </div>
                <div>
                  <h3 className="text-base font-semibold">{a.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                    {a.paper}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {a.description}
                </p>
                <div className="pt-2 border-t border-white/5">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="inline-block">
                          <Button
                            disabled
                            size="sm"
                            variant="outline"
                            className="opacity-60 cursor-not-allowed gap-2"
                          >
                            <Cpu className="h-3.5 w-3.5" />
                            Train
                          </Button>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>Training unlocks in Phase 2</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6 glass-card rounded-xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm">Training Console</h3>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
          </div>
        </div>
        <div className="p-5 font-mono text-xs space-y-1.5 bg-[#05060f]">
          {LOG_LINES.map((line, i) => (
            <div key={i} className="flex gap-3">
              <span className="text-muted-foreground/50 shrink-0">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-foreground/80">{line}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 pt-2">
            <span className="text-primary">$</span>
            <span className="h-3.5 w-1.5 bg-primary animate-pulse" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

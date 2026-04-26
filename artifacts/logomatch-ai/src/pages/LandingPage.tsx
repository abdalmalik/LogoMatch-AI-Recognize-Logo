import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Brain,
  Zap,
  Network,
  ImagePlus,
  ScanLine,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const FEATURES = [
  {
    icon: Network,
    title: "Prototypical Networks",
    desc: "Class prototypes from a tiny support set. Learn new logos with just 5 reference images.",
  },
  {
    icon: Brain,
    title: "Siamese Networks",
    desc: "Twin embedding towers compare unknown logos against your reference set with cosine similarity.",
  },
  {
    icon: Zap,
    title: "5-Shot Learning",
    desc: "No retraining required. Add a new brand, drop 5 logos, and the system can recognize it.",
  },
];

const STEPS = [
  {
    icon: ImagePlus,
    title: "Upload 5 reference logos",
    desc: "Curate a support set of 5 clean logo images per company.",
  },
  {
    icon: Brain,
    title: "Embed & store",
    desc: "Each logo is encoded into a high-dimensional vector and saved as a class prototype.",
  },
  {
    icon: ScanLine,
    title: "Recognize in one shot",
    desc: "Drop an unknown logo and the closest prototype wins — with a confidence score.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[-20%] left-[10%] h-[600px] w-[600px] rounded-full bg-primary/20 blur-[140px]" />
        <div className="absolute top-[10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-accent/20 blur-[140px]" />
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
      </div>

      <header className="px-6 md:px-12 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.5)]">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold">LogoMatch</p>
            <p className="text-[10px] uppercase tracking-widest text-primary">AI</p>
          </div>
        </div>
        <Link href="/dashboard">
          <Button variant="ghost" className="gap-2">
            Open Console <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </header>

      <section className="px-6 md:px-12 pt-16 pb-24 max-w-6xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-card text-xs mb-6"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          Few-shot logo recognition · Phase 1 Live
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight"
        >
          Recognize any logo from{" "}
          <span className="bg-gradient-to-r from-primary via-purple-400 to-accent bg-clip-text text-transparent">
            just 5 images
          </span>
          .
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-6 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto"
        >
          LogoMatch AI brings few-shot learning to brand identification. Upload a small
          support set per company and let Prototypical and Siamese networks do the rest.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link href="/add-logo">
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 shadow-[0_0_30px_rgba(99,102,241,0.45)] gap-2 px-8"
            >
              Upload Your First Logo <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="lg" variant="outline" className="gap-2 px-8">
              View Dashboard
            </Button>
          </Link>
        </motion.div>
      </section>

      <section className="px-6 md:px-12 pb-24 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="glass-card rounded-xl p-6 hover:shadow-[0_0_30px_rgba(99,102,241,0.3)] transition-shadow"
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary mb-4">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="px-6 md:px-12 pb-32 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-widest text-primary font-medium">
            How it works
          </p>
          <h2 className="mt-3 text-3xl md:text-4xl font-semibold">
            From upload to prediction in three steps.
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5 relative">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card rounded-xl p-6 relative"
              >
                <div className="absolute -top-3 left-6 h-7 w-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-semibold shadow-[0_0_15px_rgba(99,102,241,0.6)]">
                  {i + 1}
                </div>
                <div className="h-10 w-10 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center text-accent mb-4 mt-2">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {s.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      <footer className="px-6 md:px-12 py-8 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>LogoMatch AI · Phase 1 Foundation Build</p>
          <p>Few-shot learning · Prototypical & Siamese networks · 2026</p>
        </div>
      </footer>
    </div>
  );
}

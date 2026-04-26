import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  PlusSquare,
  ScanLine,
  Target,
  FlaskConical,
  Database,
  LineChart,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/add-logo", label: "Add Company Logo", icon: PlusSquare },
  { href: "/recognize", label: "Recognize Logo", icon: ScanLine },
  { href: "/evaluation", label: "Evaluation", icon: Target },
  { href: "/model-lab", label: "Model Lab", icon: FlaskConical },
  { href: "/dataset", label: "Dataset Manager", icon: Database },
  { href: "/experiments", label: "Experiments", icon: LineChart },
];

type SidebarProps = {
  onNavigate?: () => void;
};

export function Sidebar({ onNavigate }: SidebarProps) {
  const [location] = useLocation();

  return (
    <aside className="h-full w-full md:w-64 shrink-0 flex flex-col bg-sidebar/80 backdrop-blur-xl border-r border-white/5">
      <Link href="/" onClick={onNavigate}>
        <div className="flex items-center gap-2.5 px-5 py-5 cursor-pointer hover-elevate rounded-md mx-2 mt-2">
          <div className="relative h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.5)]">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">LogoMatch</p>
            <p className="text-[10px] uppercase tracking-widest text-primary">AI</p>
          </div>
        </div>
      </Link>

      <div className="px-3 mt-2">
        <p className="px-2 text-[10px] uppercase tracking-widest text-muted-foreground/70 font-medium">
          Workspace
        </p>
      </div>

      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = location === item.href;
          return (
            <Link key={item.href} href={item.href} onClick={onNavigate}>
              <div
                className={cn(
                  "relative group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all cursor-pointer",
                  active
                    ? "bg-primary/10 text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5",
                )}
              >
                {active && (
                  <motion.div
                    layoutId="active-nav"
                    className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r bg-gradient-to-b from-primary to-accent shadow-[0_0_10px_rgba(99,102,241,0.7)]"
                  />
                )}
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0",
                    active && "text-primary drop-shadow-[0_0_6px_rgba(59,130,246,0.7)]",
                  )}
                />
                <span className="font-medium">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <div className="glass-card rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <p className="text-xs font-medium">Phase 3.5 - Diagnostics</p>
          </div>
          <p className="text-[10px] leading-relaxed text-muted-foreground">
            Prototype matching is live; evaluation tracks accuracy.
          </p>
        </div>
      </div>
    </aside>
  );
}

import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  Building2,
  ImageIcon,
  ScanSearch,
  Cpu,
  ArrowRight,
  PlusSquare,
  ScanLine,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { MetricCard } from "@/components/MetricCard";
import { useCompanies } from "@/store/companies";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { state } = useCompanies();
  const totalCompanies = state.companies.length;
  const totalImages = state.companies.reduce((acc, c) => acc + c.images.length, 0);

  const recent = [...state.companies].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="A quick look at your dataset, model state, and recent activity."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Companies"
          value={totalCompanies}
          icon={<Building2 className="h-5 w-5" />}
          accent="blue"
          hint={totalCompanies === 0 ? "No companies yet" : "Active in dataset"}
        />
        <MetricCard
          label="Uploaded Logo Images"
          value={totalImages}
          icon={<ImageIcon className="h-5 w-5" />}
          accent="purple"
          hint="5 per company"
        />
        <MetricCard
          label="Recognition Tests"
          value={0}
          icon={<ScanSearch className="h-5 w-5" />}
          accent="blue"
          hint="Awaiting model"
        />
        <MetricCard
          label="Model Status"
          value="Not Trained"
          icon={<Cpu className="h-5 w-5" />}
          accent="purple"
          hint="Phase 2 unlocks training"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-xl p-6 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Recent Activity</h3>
              <p className="text-xs text-muted-foreground">
                Most recently added companies
              </p>
            </div>
            <Link href="/dataset">
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                View All <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          {recent.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">
              <ImageIcon className="h-8 w-8 mx-auto mb-3 opacity-40" />
              No companies yet. Add your first logo set to get started.
            </div>
          ) : (
            <div className="space-y-2.5">
              {recent.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-4 p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:border-primary/30 hover:bg-white/[0.04] transition-colors"
                >
                  <div className="flex -space-x-2">
                    {c.images.slice(0, 3).map((img) => (
                      <div
                        key={img.id}
                        className="h-10 w-10 rounded-md border border-white/10 bg-white/5 overflow-hidden flex items-center justify-center"
                      >
                        <img
                          src={img.dataUrl}
                          alt={c.name}
                          className="h-full w-full object-contain p-1"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{c.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.images.length} reference images
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground hidden sm:block">
                    {new Date(c.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-card rounded-xl p-6 space-y-4"
        >
          <div>
            <h3 className="font-semibold">Quick Actions</h3>
            <p className="text-xs text-muted-foreground">Jump back into the workflow</p>
          </div>

          <Link href="/add-logo">
            <button className="w-full text-left p-4 rounded-lg border border-white/10 bg-white/[0.02] hover:border-primary/40 hover:bg-primary/5 transition-all group">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-md bg-primary/10 border border-primary/30 text-primary flex items-center justify-center">
                  <PlusSquare className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Add Company Logo</p>
                  <p className="text-xs text-muted-foreground">Upload 5 reference images</p>
                </div>
                <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </button>
          </Link>

          <Link href="/recognize">
            <button className="w-full text-left p-4 rounded-lg border border-white/10 bg-white/[0.02] hover:border-accent/40 hover:bg-accent/5 transition-all group">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-md bg-accent/10 border border-accent/30 text-accent flex items-center justify-center">
                  <ScanLine className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Recognize Logo</p>
                  <p className="text-xs text-muted-foreground">Test against the dataset</p>
                </div>
                <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground group-hover:text-accent transition-colors" />
              </div>
            </button>
          </Link>

          <div className="rounded-lg p-4 bg-gradient-to-br from-primary/10 to-accent/10 border border-white/10">
            <p className="text-xs uppercase tracking-wider text-primary font-medium">
              Pipeline
            </p>
            <p className="text-sm font-medium mt-1">Phase 1 of 2 complete</p>
            <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full w-1/2 bg-gradient-to-r from-primary to-accent" />
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">
              Next: connect FastAPI backend & few-shot model
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

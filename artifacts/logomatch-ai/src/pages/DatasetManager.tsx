import { Link } from "wouter";
import { motion } from "framer-motion";
import { Database, PlusSquare, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { useCompanies } from "@/store/companies";

export default function DatasetManager() {
  const { state, dispatch } = useCompanies();
  const sorted = [...state.companies].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div>
      <PageHeader
        title="Dataset Manager"
        subtitle="Browse every company in your support set. Each entry holds 5 reference images."
        action={
          <Link href="/add-logo">
            <Button className="bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 gap-2">
              <PlusSquare className="h-4 w-4" />
              Add Company
            </Button>
          </Link>
        }
      />

      {sorted.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-xl p-12 text-center"
        >
          <div className="h-14 w-14 mx-auto rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary mb-4">
            <Database className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold">Your dataset is empty</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
            Add your first company with 5 logo images to start building your few-shot
            support set.
          </p>
          <Link href="/add-logo">
            <Button className="mt-6 bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 gap-2">
              <PlusSquare className="h-4 w-4" />
              Add Your First Company
            </Button>
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {sorted.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="glass-card rounded-xl p-5 hover:shadow-[0_0_25px_rgba(99,102,241,0.25)] transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-base font-semibold">{c.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {c.images.length} images · added {new Date(c.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => dispatch({ type: "REMOVE_COMPANY", payload: c.id })}
                  className="h-8 w-8 rounded-md border border-white/10 text-muted-foreground hover:text-destructive hover:border-destructive/40 flex items-center justify-center transition-colors"
                  aria-label={`Remove ${c.name}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {c.images.map((img) => (
                  <div
                    key={img.id}
                    className="aspect-square rounded-md bg-white/5 border border-white/5 overflow-hidden"
                  >
                    <img
                      src={img.dataUrl}
                      alt={img.name}
                      className="h-full w-full object-contain p-1.5"
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

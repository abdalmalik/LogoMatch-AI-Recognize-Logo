import { Link } from "wouter";
import { motion } from "framer-motion";
import { Database, PlusSquare, Trash2, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { useCompaniesQuery, useDeleteCompanyMutation } from "@/store/companies";

export default function DatasetManager() {
  const { data: companies = [], isLoading, isError, error, refetch } = useCompaniesQuery();
  const deleteMutation = useDeleteCompanyMutation();

  const handleDelete = async (id: number, name: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success(`${name} removed`);
    } catch (err) {
      const m = err instanceof Error ? err.message : "Unknown error";
      toast.error("Failed to delete", { description: m });
    }
  };

  return (
    <div>
      <PageHeader
        title="Dataset Manager"
        subtitle="Browse every company in your support set. Each entry holds 5 reference images."
        action={
          <Link href="/add-logo">
            <Button className="bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 gap-2 cursor-pointer">
              <PlusSquare className="h-4 w-4" />
              Add Company
            </Button>
          </Link>
        }
      />

      {isLoading ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <Loader2 className="h-6 w-6 mx-auto animate-spin text-primary" />
          <p className="text-sm text-muted-foreground mt-3">Loading dataset…</p>
        </div>
      ) : isError ? (
        <div className="glass-card rounded-xl p-8 border border-destructive/30">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm font-medium">Could not load dataset</p>
              <p className="text-xs text-muted-foreground">
                {error instanceof Error ? error.message : "Unknown error"}
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => refetch()}
                className="cursor-pointer"
              >
                Retry
              </Button>
            </div>
          </div>
        </div>
      ) : companies.length === 0 ? (
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
            <Button className="mt-6 bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 gap-2 cursor-pointer">
              <PlusSquare className="h-4 w-4" />
              Add Your First Company
            </Button>
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {companies.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="glass-card rounded-xl p-5 hover:shadow-[0_0_25px_rgba(99,102,241,0.25)] transition-shadow"
            >
              <div className="flex items-start justify-between mb-4 gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-semibold truncate">{c.name}</h3>
                  {c.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {c.description}
                    </p>
                  )}
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {c.images.length} images · added{" "}
                    {new Date(c.createdAt + "Z").toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(c.id, c.name)}
                  disabled={deleteMutation.isPending}
                  className="h-8 w-8 rounded-md border border-white/10 text-muted-foreground hover:text-destructive hover:border-destructive/40 flex items-center justify-center transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
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
                      src={img.url}
                      alt={img.originalName}
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

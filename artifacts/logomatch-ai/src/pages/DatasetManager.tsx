import { Link } from "wouter";
import { motion } from "framer-motion";
import { Database, PlusSquare, Trash2, AlertCircle, Loader2, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { StatusPill } from "@/components/StatusPill";
import { Button } from "@/components/ui/button";
import {
  useCompaniesQuery,
  useDeleteCompanyMutation,
  useRegenerateAllPrototypesMutation,
  useRegenerateCompanyPrototypeMutation,
} from "@/store/companies";

export default function DatasetManager() {
  const { data: companies = [], isLoading, isError, error, refetch } = useCompaniesQuery();
  const deleteMutation = useDeleteCompanyMutation();
  const regenerateCompanyMutation = useRegenerateCompanyPrototypeMutation();
  const regenerateAllMutation = useRegenerateAllPrototypesMutation();

  const handleDelete = async (id: number, name: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success(`${name} removed`);
    } catch (err) {
      const m = err instanceof Error ? err.message : "Unknown error";
      toast.error("Failed to delete", { description: m });
    }
  };

  const handleRegenerateCompany = async (id: number, name: string) => {
    try {
      await regenerateCompanyMutation.mutateAsync(id);
      toast.success("Prototype regenerated", { description: name });
    } catch (err) {
      const m = err instanceof Error ? err.message : "Unknown error";
      toast.error("Failed to regenerate prototype", { description: m });
    }
  };

  const handleRegenerateAll = async () => {
    try {
      const result = await regenerateAllMutation.mutateAsync();
      toast.success("Prototype regeneration complete", {
        description:
          result.failed && result.failed > 0
            ? `${result.regenerated} regenerated, ${result.failed} failed`
            : `${result.regenerated} companies regenerated`,
      });
    } catch (err) {
      const m = err instanceof Error ? err.message : "Unknown error";
      toast.error("Failed to regenerate prototypes", { description: m });
    }
  };

  const isMutating =
    deleteMutation.isPending ||
    regenerateCompanyMutation.isPending ||
    regenerateAllMutation.isPending;

  return (
    <div>
      <PageHeader
        title="Dataset Manager"
        subtitle="Browse every company in your support set. Each entry holds 5 reference images."
        action={
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={handleRegenerateAll}
              disabled={companies.length === 0 || isMutating}
              className="gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              {regenerateAllMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCcw className="h-4 w-4" />
              )}
              Regenerate All Prototypes
            </Button>
            <Link href="/add-logo">
              <Button className="bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 gap-2 cursor-pointer">
                <PlusSquare className="h-4 w-4" />
                Add Company
              </Button>
            </Link>
          </div>
        }
      />

      {isLoading ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <Loader2 className="h-6 w-6 mx-auto animate-spin text-primary" />
          <p className="text-sm text-muted-foreground mt-3">Loading dataset...</p>
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
          {companies.map((company, index) => {
            const hasExpectedImageCount = company.images.length === 5;
            return (
              <motion.div
                key={company.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="glass-card rounded-xl p-5 hover:shadow-[0_0_25px_rgba(99,102,241,0.25)] transition-shadow"
              >
                <div className="flex items-start justify-between mb-4 gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold truncate">{company.name}</h3>
                    {company.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {company.description}
                      </p>
                    )}
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {company.images.length} images - added{" "}
                      {new Date(company.createdAt + "Z").toLocaleString()}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <StatusPill
                        label={company.prototypeReady ? "Prototype Ready" : "Missing Prototype"}
                        variant={company.prototypeReady ? "active" : "warning"}
                        className="px-2.5 py-0.5 text-[11px]"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRegenerateCompany(company.id, company.name)}
                        disabled={isMutating}
                        className="h-7 px-2 text-[11px] gap-1.5 cursor-pointer disabled:cursor-not-allowed"
                      >
                        {regenerateCompanyMutation.isPending ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <RefreshCcw className="h-3.5 w-3.5" />
                        )}
                        Regenerate Prototype
                      </Button>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(company.id, company.name)}
                    disabled={isMutating}
                    className="h-8 w-8 rounded-md border border-white/10 text-muted-foreground hover:text-destructive hover:border-destructive/40 flex items-center justify-center transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label={`Remove ${company.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                {!hasExpectedImageCount && (
                  <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 flex items-start gap-2 text-xs text-amber-200">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
                    <p>
                      This company has {company.images.length} usable images. Prototype
                      matching expects exactly 5 reference images.
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-5 gap-2">
                  {company.images.map((img) => (
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
                  {Array.from({ length: Math.max(0, 5 - company.images.length) }).map(
                    (_, missingIndex) => (
                      <div
                        key={`missing-${company.id}-${missingIndex}`}
                        className="aspect-square rounded-md bg-white/[0.02] border border-dashed border-white/10 flex items-center justify-center text-[10px] text-muted-foreground"
                      >
                        Missing
                      </div>
                    ),
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

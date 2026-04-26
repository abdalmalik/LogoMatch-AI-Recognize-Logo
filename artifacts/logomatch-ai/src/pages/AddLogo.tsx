import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Save, Trash2, Building2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { UploadBox } from "@/components/UploadBox";
import { ImagePreviewGrid } from "@/components/ImagePreviewGrid";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useCompanies } from "@/store/companies";
import { fileToDataUrl, isImageFile } from "@/lib/file-utils";

const REQUIRED_COUNT = 5;

type StagedFile = {
  id: string;
  file: File;
  dataUrl: string;
};

export default function AddLogo() {
  const { state, dispatch } = useCompanies();
  const [companyName, setCompanyName] = useState("");
  const [staged, setStaged] = useState<StagedFile[]>([]);
  const [rejected, setRejected] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const onFilesSelected = async (files: File[]) => {
    setRejected([]);
    const accepted: File[] = [];
    const refused: string[] = [];
    for (const f of files) {
      if (isImageFile(f)) {
        accepted.push(f);
      } else {
        refused.push(f.name);
      }
    }
    if (refused.length > 0) setRejected(refused);

    const next: StagedFile[] = [];
    for (const f of accepted) {
      const dataUrl = await fileToDataUrl(f);
      next.push({ id: crypto.randomUUID(), file: f, dataUrl });
    }
    setStaged((prev) => [...prev, ...next]);
  };

  const removeStaged = (id: string) =>
    setStaged((prev) => prev.filter((s) => s.id !== id));

  const trimmedName = companyName.trim();
  const countMessage = useMemo(() => {
    if (staged.length === REQUIRED_COUNT) return null;
    if (staged.length < REQUIRED_COUNT) {
      return `Please upload exactly ${REQUIRED_COUNT} logo images. You currently have ${staged.length}.`;
    }
    return `Too many images. Please remove ${staged.length - REQUIRED_COUNT} to keep exactly ${REQUIRED_COUNT}.`;
  }, [staged.length]);

  const isValid = trimmedName.length > 0 && staged.length === REQUIRED_COUNT;

  const handleSave = async () => {
    if (!isValid) return;
    setSubmitting(true);
    try {
      dispatch({
        type: "ADD_COMPANY",
        payload: {
          id: crypto.randomUUID(),
          name: trimmedName,
          createdAt: Date.now(),
          images: staged.map((s) => ({
            id: s.id,
            dataUrl: s.dataUrl,
            name: s.file.name,
          })),
        },
      });
      toast.success(`${trimmedName} added to dataset`, {
        description: `${REQUIRED_COUNT} reference images stored.`,
      });
      setCompanyName("");
      setStaged([]);
      setRejected([]);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    return () => {
      // dataUrls live in memory, no object URL cleanup needed
    };
  }, []);

  const previewItems = staged.map((s) => ({
    id: s.id,
    src: s.dataUrl,
    name: s.file.name,
  }));

  return (
    <div>
      <PageHeader
        title="Add Company Logo"
        subtitle="Upload exactly 5 reference images per company. The model uses these as a few-shot support set."
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="xl:col-span-2 glass-card rounded-xl p-6 space-y-6"
        >
          <div className="space-y-2">
            <Label htmlFor="company-name" className="text-sm font-medium">
              Company Name
            </Label>
            <Input
              id="company-name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Acme Corp"
              className="bg-white/[0.03] border-white/10 focus-visible:ring-primary/40"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Reference Images</Label>
              <span
                className={`text-xs font-mono ${
                  staged.length === REQUIRED_COUNT
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {staged.length} / {REQUIRED_COUNT}
              </span>
            </div>

            <UploadBox
              multiple
              accept="image/*"
              onFilesSelected={onFilesSelected}
              label="Drop images or click to browse"
              hint="Image files only · 5 required per company"
              disabled={staged.length >= REQUIRED_COUNT}
            />

            {rejected.length > 0 && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 flex items-start gap-2 text-xs text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Only image files are accepted.</p>
                  <p className="opacity-90">Rejected: {rejected.join(", ")}</p>
                </div>
              </div>
            )}

            {staged.length > 0 && (
              <div className="pt-2">
                <ImagePreviewGrid
                  items={previewItems}
                  onRemove={removeStaged}
                  emptySlots={Math.max(0, REQUIRED_COUNT - staged.length)}
                />
              </div>
            )}

            {countMessage && (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 flex items-start gap-2 text-xs text-amber-300">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <p>{countMessage}</p>
              </div>
            )}

            {isValid && (
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 flex items-start gap-2 text-xs text-primary">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                <p>Ready to save. Exactly 5 images selected.</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-white/5">
            <Button
              onClick={handleSave}
              disabled={!isValid || submitting}
              className="bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 shadow-[0_0_20px_rgba(99,102,241,0.4)] gap-2"
            >
              <Save className="h-4 w-4" />
              Save Company
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setCompanyName("");
                setStaged([]);
                setRejected([]);
              }}
              disabled={!companyName && staged.length === 0}
            >
              Reset
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-card rounded-xl p-6 space-y-4"
        >
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              In Your Dataset
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {state.companies.length} compan
              {state.companies.length === 1 ? "y" : "ies"} added so far
            </p>
          </div>

          {state.companies.length === 0 ? (
            <div className="text-center py-10 text-xs text-muted-foreground">
              Your saved companies will show up here.
            </div>
          ) : (
            <div className="space-y-3">
              {state.companies.map((c) => (
                <div
                  key={c.id}
                  className="rounded-lg border border-white/5 bg-white/[0.02] p-3 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium truncate">{c.name}</p>
                    <button
                      onClick={() =>
                        dispatch({ type: "REMOVE_COMPANY", payload: c.id })
                      }
                      className="text-muted-foreground hover:text-destructive transition-colors"
                      aria-label={`Remove ${c.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {c.images.map((img) => (
                      <div
                        key={img.id}
                        className="aspect-square rounded bg-white/5 overflow-hidden border border-white/5"
                      >
                        <img
                          src={img.dataUrl}
                          alt={img.name}
                          className="h-full w-full object-contain p-1"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

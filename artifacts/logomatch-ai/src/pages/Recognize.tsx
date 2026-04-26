import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, ScanLine, X, Sparkles, Info, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { UploadBox } from "@/components/UploadBox";
import { ResultCard } from "@/components/ResultCard";
import { StatusPill } from "@/components/StatusPill";
import { Button } from "@/components/ui/button";
import { useRecognizeDemoMutation } from "@/store/companies";
import { fileToDataUrl, isImageFile } from "@/lib/file-utils";
import type { RecognizeDemoResponse } from "@/services/api";

export default function Recognize() {
  const recognizeMutation = useRecognizeDemoMutation();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<{ src: string; name: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RecognizeDemoResponse | null>(null);

  const onFilesSelected = async (files: File[]) => {
    setError(null);
    setResult(null);
    const f = files[0];
    if (!f) return;
    if (!isImageFile(f)) {
      setError(`"${f.name}" is not an image file. Use PNG, JPG, JPEG, SVG, or WEBP.`);
      toast.error("Invalid file type", {
        description: "Only PNG, JPG, JPEG, SVG, or WEBP images are accepted.",
      });
      return;
    }
    const src = await fileToDataUrl(f);
    setFile(f);
    setPreview({ src, name: f.name });
  };

  const clearImage = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
  };

  const runRecognize = async () => {
    if (!file) return;
    setResult(null);
    try {
      const data = await recognizeMutation.mutateAsync(file);
      setResult(data);
      toast.success("Upload received", {
        description: data.message,
      });
    } catch (err) {
      const m = err instanceof Error ? err.message : "Unknown error";
      setError(m);
      toast.error("Recognition request failed", { description: m });
    }
  };

  const running = recognizeMutation.isPending;
  const canRecognize = !!file && !running;

  return (
    <div>
      <PageHeader
        title="Recognize Logo"
        subtitle="Upload one test image. The model will compare it against the support sets you've uploaded."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-xl p-6 space-y-4"
        >
          <div>
            <h3 className="font-semibold">Test Image</h3>
            <p className="text-xs text-muted-foreground">
              One image · accepted formats: PNG, JPG, JPEG, SVG, WEBP
            </p>
          </div>

          {preview ? (
            <div className="relative rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
              <button
                onClick={clearImage}
                disabled={running}
                className="absolute top-3 right-3 z-10 h-7 w-7 rounded-full bg-black/70 backdrop-blur border border-white/10 flex items-center justify-center hover:bg-destructive/80 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Clear image"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <div className="aspect-square max-h-[400px] flex items-center justify-center p-6">
                <img
                  src={preview.src}
                  alt={preview.name}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div className="border-t border-white/5 px-4 py-2 text-xs text-muted-foreground truncate">
                {preview.name}
              </div>
            </div>
          ) : (
            <UploadBox
              accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
              onFilesSelected={onFilesSelected}
              label="Drop a logo to recognize"
              hint="Single image · PNG, JPG, JPEG, SVG, WEBP"
            />
          )}

          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 flex items-start gap-2 text-xs text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2 border-t border-white/5">
            <Button
              onClick={runRecognize}
              disabled={!canRecognize}
              className="bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 shadow-[0_0_20px_rgba(99,102,241,0.4)] gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none cursor-pointer"
            >
              {running ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ScanLine className="h-4 w-4" />
              )}
              {running ? "Uploading…" : "Recognize"}
            </Button>
            <Button
              variant="ghost"
              onClick={clearImage}
              disabled={(!preview && !result) || running}
              className="cursor-pointer disabled:cursor-not-allowed"
            >
              Clear Image
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="space-y-4"
        >
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="demo-result"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
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
                    <StatusPill label={result.status} variant="warning" />
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">
                        Predicted Company
                      </p>
                      <p className="text-2xl font-semibold mt-1 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        {result.predicted_company ?? "Awaiting AI Backend"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">
                        Similarity Score
                      </p>
                      <p className="font-mono text-sm mt-1 text-muted-foreground">
                        {result.similarity_score ?? "Not available in Phase 2"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                        Saved on server as
                      </p>
                      <code className="text-[11px] font-mono break-all rounded bg-white/5 border border-white/10 px-2 py-1 inline-block text-muted-foreground">
                        {result.uploaded_image_path}
                      </code>
                    </div>

                    <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 flex items-start gap-2 text-xs text-foreground/80">
                      <Info className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
                      <p>{result.message}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ResultCard placeholder />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="glass-card rounded-xl p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">
              Pipeline preview
            </p>
            <ol className="space-y-2 text-sm">
              <li className="flex items-center gap-3">
                <span className="h-6 w-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-mono">
                  1
                </span>
                <span className="text-muted-foreground">
                  Encode test image into embedding vector
                </span>
              </li>
              <li className="flex items-center gap-3">
                <span className="h-6 w-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-mono">
                  2
                </span>
                <span className="text-muted-foreground">
                  Compare against company prototypes
                </span>
              </li>
              <li className="flex items-center gap-3">
                <span className="h-6 w-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-mono">
                  3
                </span>
                <span className="text-muted-foreground">
                  Return nearest match with confidence
                </span>
              </li>
            </ol>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

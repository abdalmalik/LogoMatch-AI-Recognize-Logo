import { useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, ScanLine, X } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { UploadBox } from "@/components/UploadBox";
import { ResultCard } from "@/components/ResultCard";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { fileToDataUrl, isImageFile } from "@/lib/file-utils";

export default function Recognize() {
  const [preview, setPreview] = useState<{ src: string; name: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onFilesSelected = async (files: File[]) => {
    setError(null);
    const file = files[0];
    if (!file) return;
    if (!isImageFile(file)) {
      setError(`"${file.name}" is not an image file.`);
      return;
    }
    const src = await fileToDataUrl(file);
    setPreview({ src, name: file.name });
  };

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
              One image · accepted formats: PNG, JPG, SVG, WEBP
            </p>
          </div>

          {preview ? (
            <div className="relative rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
              <button
                onClick={() => setPreview(null)}
                className="absolute top-3 right-3 z-10 h-7 w-7 rounded-full bg-black/70 backdrop-blur border border-white/10 flex items-center justify-center hover:bg-destructive/80 transition-colors"
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
              accept="image/*"
              onFilesSelected={onFilesSelected}
              label="Drop a logo to recognize"
              hint="Single image only"
            />
          )}

          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 flex items-start gap-2 text-xs text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <div className="pt-2 border-t border-white/5">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-block">
                    <Button
                      disabled
                      className="bg-gradient-to-r from-primary to-accent text-white opacity-60 cursor-not-allowed gap-2"
                    >
                      <ScanLine className="h-4 w-4" />
                      Recognize
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>AI model not yet connected</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="space-y-4"
        >
          <ResultCard placeholder />

          <div className="glass-card rounded-xl p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">
              Pipeline preview
            </p>
            <ol className="space-y-2 text-sm">
              <li className="flex items-center gap-3">
                <span className="h-6 w-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-mono">
                  1
                </span>
                <span className="text-muted-foreground">Encode test image into embedding vector</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="h-6 w-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-mono">
                  2
                </span>
                <span className="text-muted-foreground">Compare against company prototypes</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="h-6 w-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-mono">
                  3
                </span>
                <span className="text-muted-foreground">Return nearest match with confidence</span>
              </li>
            </ol>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

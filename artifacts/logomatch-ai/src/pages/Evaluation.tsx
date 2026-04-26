import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardCheck,
  Loader2,
  Target,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { MetricCard } from "@/components/MetricCard";
import { StatusPill } from "@/components/StatusPill";
import { UploadBox } from "@/components/UploadBox";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCompaniesQuery,
  useEvaluateLogoMutation,
  useEvaluationSummaryQuery,
} from "@/store/companies";
import { fileToDataUrl, isImageFile } from "@/lib/file-utils";
import type { EvaluationResponseDto, PredictionStatus } from "@/services/api";

function confidenceLabel(status: PredictionStatus | undefined): string {
  switch (status) {
    case "high_confidence":
      return "High Confidence";
    case "medium_confidence":
      return "Medium Confidence";
    case "low_confidence":
      return "Low Confidence";
    default:
      return "Unknown";
  }
}

function confidenceVariant(status: PredictionStatus | undefined): "active" | "warning" | "danger" {
  if (status === "high_confidence") return "active";
  if (status === "medium_confidence") return "warning";
  return "danger";
}

export default function Evaluation() {
  const { data: companies = [] } = useCompaniesQuery();
  const { data: storedSummary } = useEvaluationSummaryQuery();
  const evaluateMutation = useEvaluateLogoMutation();
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<{ src: string; name: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EvaluationResponseDto | null>(null);

  useEffect(() => {
    const firstCompany = companies[0];
    if (!selectedCompanyId && firstCompany) {
      setSelectedCompanyId(String(firstCompany.id));
    }
  }, [companies, selectedCompanyId]);

  const summary = result?.summary ??
    storedSummary ?? {
      total: 0,
      correct: 0,
      incorrect: 0,
      accuracy_percentage: 0,
    };
  const selectedCompany = companies.find((company) => String(company.id) === selectedCompanyId);
  const hasPrototype = companies.some((company) => company.prototypeReady);
  const running = evaluateMutation.isPending;
  const canEvaluate = !!file && !!selectedCompanyId && !running;

  const onFilesSelected = async (files: File[]) => {
    setError(null);
    setResult(null);
    const nextFile = files[0];
    if (!nextFile) return;
    if (!isImageFile(nextFile)) {
      setError(`"${nextFile.name}" is not an image file. Use PNG, JPG, JPEG, SVG, or WEBP.`);
      toast.error("Invalid file type", {
        description: "Only PNG, JPG, JPEG, SVG, or WEBP images are accepted.",
      });
      return;
    }
    setFile(nextFile);
    setPreview({ src: await fileToDataUrl(nextFile), name: nextFile.name });
  };

  const clearImage = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
  };

  const runEvaluation = async () => {
    if (!file || !selectedCompanyId) return;
    setError(null);
    try {
      const data = await evaluateMutation.mutateAsync({
        expectedCompanyId: Number(selectedCompanyId),
        image: file,
      });
      setResult(data);
      if (data.correct) {
        toast.success("Evaluation recorded", {
          description: "Prediction matched the expected company.",
        });
      } else {
        toast.warning("Evaluation recorded", {
          description: "Prediction did not match the expected company.",
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      toast.error("Evaluation failed", { description: message });
    }
  };

  return (
    <div>
      <PageHeader
        title="Evaluation"
        subtitle="Upload labeled test logos and measure prototype-matching accuracy."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          label="Total Tests"
          value={summary.total}
          icon={<ClipboardCheck className="h-5 w-5" />}
          accent="blue"
          hint="Stored evaluations"
        />
        <MetricCard
          label="Correct Tests"
          value={summary.correct}
          icon={<CheckCircle2 className="h-5 w-5" />}
          accent="purple"
          hint="Expected company matched"
        />
        <MetricCard
          label="Accuracy"
          value={`${summary.accuracy_percentage}%`}
          icon={<Target className="h-5 w-5" />}
          accent="blue"
          hint={`${summary.incorrect} incorrect tests`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-xl p-6 space-y-4"
        >
          <div>
            <h3 className="font-semibold">Labeled Test</h3>
            <p className="text-xs text-muted-foreground">
              Choose the expected company, then upload one test logo.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-muted-foreground">
              Expected Company
            </label>
            <Select
              value={selectedCompanyId}
              onValueChange={setSelectedCompanyId}
              disabled={companies.length === 0 || running}
            >
              <SelectTrigger className="bg-white/[0.02] border-white/10 cursor-pointer">
                <SelectValue placeholder="Select a company" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={String(company.id)}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedCompany && (
              <p className="text-[11px] text-muted-foreground">
                {selectedCompany.images.length} reference images -{" "}
                {selectedCompany.prototypeReady ? "prototype ready" : "missing prototype"}
              </p>
            )}
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
              <div className="aspect-square max-h-[360px] flex items-center justify-center p-6">
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
              label="Drop a labeled logo test image"
              hint="Single image - PNG, JPG, JPEG, SVG, WEBP"
              disabled={companies.length === 0}
            />
          )}

          {companies.length === 0 && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 flex items-start gap-2 text-xs text-amber-200">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
              <p>Add at least one company before running evaluations.</p>
            </div>
          )}

          {companies.length > 0 && !hasPrototype && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 flex items-start gap-2 text-xs text-amber-200">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
              <p>No generated prototypes are available yet. Regenerate prototypes in Dataset Manager.</p>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 flex items-start gap-2 text-xs text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2 border-t border-white/5">
            <Button
              onClick={runEvaluation}
              disabled={!canEvaluate}
              className="bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 shadow-[0_0_20px_rgba(99,102,241,0.4)] gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none cursor-pointer"
            >
              {running ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ClipboardCheck className="h-4 w-4" />
              )}
              {running ? "Evaluating..." : "Run Evaluation"}
            </Button>
            <Button
              variant="ghost"
              onClick={clearImage}
              disabled={(!preview && !result) || running}
              className="cursor-pointer disabled:cursor-not-allowed"
            >
              Clear
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
                key="evaluation-result"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="glass-card rounded-xl p-6 space-y-5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                    {result.correct ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 text-destructive" />
                    )}
                    Evaluation Result
                  </div>
                  <StatusPill
                    label={result.correct ? "Correct" : "Incorrect"}
                    variant={result.correct ? "active" : "danger"}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      Expected
                    </p>
                    <p className="text-sm font-medium mt-1 truncate">
                      {result.expected_company.name}
                    </p>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      Predicted
                    </p>
                    <p className="text-sm font-medium mt-1 truncate">
                      {result.result.predicted_company?.name ?? "Unknown or low-confidence match"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <StatusPill
                    label={confidenceLabel(result.result.prediction_status)}
                    variant={confidenceVariant(result.result.prediction_status)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Similarity{" "}
                    <span className="font-mono text-primary">
                      {result.result.similarity_percentage ?? 0}%
                    </span>
                  </p>
                </div>

                {result.result.prediction_status === "low_confidence" && (
                  <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 flex items-start gap-2 text-xs text-amber-200">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
                    <p>The uploaded logo does not confidently match any stored company.</p>
                  </div>
                )}

                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                    Top 3 Matches
                  </p>
                  {result.result.top_matches.length > 0 ? (
                    <div className="space-y-2">
                      {result.result.top_matches.map((match, index) => (
                        <div
                          key={match.company_id}
                          className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 flex items-center justify-between gap-3"
                        >
                          <p className="text-sm font-medium truncate">
                            {index + 1}. {match.company_name}
                          </p>
                          <span className="font-mono text-xs text-primary shrink-0">
                            {match.percentage}%
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 flex items-start gap-2 text-xs text-amber-200">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
                      <p>No prototype matches were available for this evaluation.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="evaluation-placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass-card rounded-xl p-8 text-center"
              >
                <div className="h-14 w-14 mx-auto rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary mb-4">
                  <Target className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold">No evaluation result yet</h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                  Run a labeled test to store the expected company, prediction, similarity,
                  and correctness.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

import { useRef, useState, DragEvent, ChangeEvent } from "react";
import { UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

type UploadBoxProps = {
  multiple?: boolean;
  accept?: string;
  onFilesSelected: (files: File[]) => void;
  hint?: string;
  label?: string;
  disabled?: boolean;
};

export function UploadBox({
  multiple = false,
  accept = "image/*",
  onFilesSelected,
  hint = "PNG, JPG, SVG, WEBP up to 10MB each",
  label = "Drop files here or click to browse",
  disabled = false,
}: UploadBoxProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    onFilesSelected(Array.from(files));
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    handleFiles(e.dataTransfer.files);
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    e.target.value = "";
  };

  return (
    <div
      onClick={() => !disabled && inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
      className={cn(
        "relative rounded-xl border-2 border-dashed transition-all duration-200 p-10 text-center",
        disabled
          ? "border-white/5 bg-white/[0.01] cursor-not-allowed opacity-60"
          : "cursor-pointer hover:border-primary/60 hover:bg-primary/5",
        isDragging
          ? "border-primary bg-primary/10 shadow-[0_0_30px_rgba(59,130,246,0.35)]"
          : "border-white/15 bg-white/[0.02]",
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={onChange}
        className="hidden"
        disabled={disabled}
      />
      <div className="flex flex-col items-center gap-3">
        <div
          className={cn(
            "h-14 w-14 rounded-full flex items-center justify-center border transition-colors",
            isDragging
              ? "bg-primary/20 border-primary text-primary"
              : "bg-white/5 border-white/10 text-muted-foreground",
          )}
        >
          <UploadCloud className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>
      </div>
    </div>
  );
}

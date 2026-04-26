import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type ImagePreviewItem = {
  id: string;
  src: string;
  name?: string;
};

type ImagePreviewGridProps = {
  items: ImagePreviewItem[];
  onRemove?: (id: string) => void;
  emptySlots?: number;
  className?: string;
};

export function ImagePreviewGrid({
  items,
  onRemove,
  emptySlots = 0,
  className,
}: ImagePreviewGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3",
        className,
      )}
    >
      <AnimatePresence>
        {items.map((item, idx) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ delay: idx * 0.04 }}
            className="group relative aspect-square rounded-lg overflow-hidden glass-card hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-shadow"
          >
            <img
              src={item.src}
              alt={item.name ?? `logo-${idx + 1}`}
              className="absolute inset-0 h-full w-full object-contain p-3"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            {onRemove && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(item.id);
                }}
                className="absolute top-2 right-2 h-6 w-6 rounded-full bg-black/70 backdrop-blur border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/80"
                aria-label="Remove image"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            <div className="absolute bottom-1 left-2 right-2 text-[10px] text-white/70 truncate opacity-0 group-hover:opacity-100 transition-opacity">
              {item.name}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      {Array.from({ length: emptySlots }).map((_, i) => (
        <div
          key={`empty-${i}`}
          className="aspect-square rounded-lg border border-dashed border-white/10 bg-white/[0.02] flex items-center justify-center text-muted-foreground/40 text-xs"
        >
          slot {items.length + i + 1}
        </div>
      ))}
    </div>
  );
}

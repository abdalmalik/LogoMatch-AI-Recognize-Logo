import { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
};

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between border-b border-white/5 pb-6 mb-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 text-sm md:text-base text-muted-foreground max-w-2xl">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

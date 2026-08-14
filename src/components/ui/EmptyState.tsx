import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 px-6 py-16 text-center", className)}>
      <div className="flex size-12 items-center justify-center rounded-full bg-emerald-soft text-emerald">
        <Icon className="size-6" />
      </div>
      <div>
        <p className="font-[family-name:var(--font-display)] text-base font-bold text-ink">{title}</p>
        {description && <p className="mt-1 max-w-sm text-sm text-slate">{description}</p>}
      </div>
      {action}
    </div>
  );
}

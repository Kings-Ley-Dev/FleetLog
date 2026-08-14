import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: LucideIcon;
  tone?: "emerald" | "amber" | "obsidian" | "rose";
}

const toneClasses = {
  emerald: "bg-emerald-soft text-emerald-deep",
  amber: "bg-amber-soft text-[#8a5a10]",
  obsidian: "bg-obsidian text-mint",
  rose: "bg-rose-soft text-rose",
};

export function StatCard({ label, value, sub, icon: Icon, tone = "emerald" }: StatCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate">{label}</p>
          <p className="tabular mt-2 text-2xl font-semibold text-ink">{value}</p>
          {sub && <p className="mt-1 text-xs text-slate">{sub}</p>}
        </div>
        <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", toneClasses[tone])}>
          <Icon className="size-5" />
        </div>
      </div>
    </Card>
  );
}

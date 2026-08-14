import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Tone = "emerald" | "amber" | "rose" | "slate" | "mint";

const toneClasses: Record<Tone, string> = {
  emerald: "bg-emerald-soft text-emerald-deep",
  amber: "bg-amber-soft text-[#8a5a10]",
  rose: "bg-rose-soft text-rose",
  slate: "bg-cream text-slate border border-line",
  mint: "bg-obsidian text-mint",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export function Badge({ tone = "slate", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
        toneClasses[tone],
        className
      )}
      {...props}
    />
  );
}

export function statusTone(status: string): Tone {
  switch (status) {
    case "ACTIVE":
      return "emerald";
    case "IN_SERVICE":
    case "PENDING":
      return "amber";
    case "INACTIVE":
    case "DISABLED":
      return "rose";
    default:
      return "slate";
  }
}

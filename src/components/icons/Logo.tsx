import { cn } from "@/lib/utils";

/**
 * FleetLog's mark: a rounded badge with a gauge arc and needle — the same
 * "instrument dial" motif reused for the hero graphic and the live
 * efficiency gauge on the dashboard. Grounded in the product (fuel
 * efficiency telemetry), not a generic abstract glyph.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={cn("size-8", className)} aria-hidden>
      <rect width="40" height="40" rx="11" fill="#0A100C" />
      <path
        d="M10 26a10 10 0 1 1 20 0"
        stroke="#1F7A52"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M10 26a10 10 0 0 1 6.2-9.24"
        stroke="#4FF3A5"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <circle cx="20" cy="26" r="2" fill="#4FF3A5" />
      <path d="M20 26 L24.5 19.5" stroke="#4FF3A5" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ className, dark }: { className?: string; dark?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoMark />
      <span
        className={cn(
          "font-[family-name:var(--font-display)] text-lg font-bold tracking-tight",
          dark ? "text-white" : "text-ink"
        )}
      >
        FleetLog
      </span>
    </div>
  );
}

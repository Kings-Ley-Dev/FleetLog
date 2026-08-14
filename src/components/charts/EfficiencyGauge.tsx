import { rateEfficiency } from "@/lib/calculations";
import { cn } from "@/lib/utils";

interface EfficiencyGaugeProps {
  value: number; // km/L
  max?: number;
  size?: number;
  dark?: boolean;
  className?: string;
}

const toneColor = { poor: "#E5535C", fair: "#F2A93B", good: "#1F7A52" } as const;
const toneColorDark = { poor: "#FF8A90", fair: "#FFC46B", good: "#4FF3A5" } as const;

/** Semicircular instrument gauge — the same dial motif as the logo. The
 * numeric readout lives below the dial (not inside the SVG) so the needle
 * never overlaps the digits at any angle. Pass `dark` when placing it on
 * an obsidian surface (marketing hero, login panel). */
export function EfficiencyGauge({ value, max = 20, size = 220, dark, className }: EfficiencyGaugeProps) {
  const clamped = Math.max(0, Math.min(value, max));
  const pct = clamped / max;
  const startAngle = 180;
  const endAngle = 0;
  const sweep = startAngle - endAngle;
  const angle = startAngle - pct * sweep;

  const cx = size / 2;
  const cy = size / 2 + 4;
  const r = size / 2 - 18;

  const polar = (deg: number, radius = r) => {
    const rad = (deg * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy - radius * Math.sin(rad) };
  };

  const needleEnd = polar(angle, r - 22);

  const rating = rateEfficiency(value);
  const color = dark ? toneColorDark[rating] : toneColor[rating];

  // Three zone arcs: poor (0-30%), fair (30-55%), good (55-100%) of the scale
  const zones = [
    { from: 180, to: 180 - 0.3 * sweep, color: "#E5535C" },
    { from: 180 - 0.3 * sweep, to: 180 - 0.55 * sweep, color: "#F2A93B" },
    { from: 180 - 0.55 * sweep, to: 0, color: "#1F7A52" },
  ];

  const arcPath = (fromDeg: number, toDeg: number) => {
    const p1 = polar(fromDeg);
    const p2 = polar(toDeg);
    const largeArc = fromDeg - toDeg > 180 ? 1 : 0;
    return `M ${p1.x} ${p1.y} A ${r} ${r} 0 ${largeArc} 1 ${p2.x} ${p2.y}`;
  };

  const pivot = polar(90, 0);
  const start = polar(180);
  const end = polar(0);

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <svg width={size} height={size / 2 + 24} viewBox={`0 0 ${size} ${size / 2 + 24}`}>
        {zones.map((z, i) => (
          <path
            key={i}
            d={arcPath(z.from, z.to)}
            stroke={z.color}
            strokeOpacity={dark ? 0.28 : 0.18}
            strokeWidth={13}
            strokeLinecap="round"
            fill="none"
          />
        ))}
        <path d={arcPath(180, angle)} stroke={color} strokeWidth={13} strokeLinecap="round" fill="none" />
        <line
          x1={pivot.x}
          y1={pivot.y}
          x2={needleEnd.x}
          y2={needleEnd.y}
          stroke={dark ? "#FFFFFF" : "#12201A"}
          strokeWidth={2.5}
          strokeLinecap="round"
        />
        <circle cx={pivot.x} cy={pivot.y} r={4.5} fill={dark ? "#FFFFFF" : "#12201A"} />
        <text
          x={start.x}
          y={cy + 15}
          textAnchor="start"
          fill={dark ? "rgba(255,255,255,0.35)" : "#8B988F"}
          style={{ fontSize: 10 }}
        >
          0
        </text>
        <text
          x={end.x}
          y={cy + 15}
          textAnchor="end"
          fill={dark ? "rgba(255,255,255,0.35)" : "#8B988F"}
          style={{ fontSize: 10 }}
        >
          {max}
        </text>
      </svg>

      <div className="-mt-1 flex flex-col items-center">
        <p
          className="tabular text-3xl font-semibold"
          style={{ color: dark ? "#FFFFFF" : "#12201A", fontFamily: "var(--font-data)" }}
        >
          {value.toFixed(1)}
        </p>
        <p className={cn("text-xs", dark ? "text-white/50" : "text-slate")}>km per litre</p>
      </div>
    </div>
  );
}

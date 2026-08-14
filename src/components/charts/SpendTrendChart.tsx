"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatGHS } from "@/lib/utils";

interface Point {
  month: string;
  spendGHS: number;
  liters: number;
}

export function SpendTrendChart({ data }: { data: Point[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <defs>
          <linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1F7A52" stopOpacity={0.28} />
            <stop offset="100%" stopColor="#1F7A52" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#E0E6DD" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12, fill: "#5B6B63", fontFamily: "var(--font-body)" }}
          axisLine={{ stroke: "#E0E6DD" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#5B6B63", fontFamily: "var(--font-data)" }}
          axisLine={false}
          tickLine={false}
          width={56}
          tickFormatter={(v: number) => `${Math.round(v)}`}
        />
        <Tooltip
          formatter={(value) => [formatGHS(Number(value)), "Spend"]}
          contentStyle={{
            borderRadius: 12,
            border: "1px solid #E0E6DD",
            fontFamily: "var(--font-body)",
            fontSize: 13,
          }}
        />
        <Area
          type="monotone"
          dataKey="spendGHS"
          stroke="#1F7A52"
          strokeWidth={2.5}
          fill="url(#spendFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

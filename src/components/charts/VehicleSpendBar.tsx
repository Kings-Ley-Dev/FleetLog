"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { formatGHS } from "@/lib/utils";

interface Row {
  licensePlate: string;
  spendGHS: number;
  efficiencyKmL: number;
}

const BARS = ["#1F7A52", "#4FF3A5", "#145236", "#F2A93B"];

export function VehicleSpendBar({ data }: { data: Row[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <CartesianGrid stroke="#E0E6DD" vertical={false} />
        <XAxis
          dataKey="licensePlate"
          tick={{ fontSize: 11, fill: "#5B6B63", fontFamily: "var(--font-data)" }}
          axisLine={{ stroke: "#E0E6DD" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#5B6B63", fontFamily: "var(--font-data)" }}
          axisLine={false}
          tickLine={false}
          width={56}
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
        <Bar dataKey="spendGHS" radius={[8, 8, 0, 0]} maxBarSize={40}>
          {data.map((_, i) => (
            <Cell key={i} fill={BARS[i % BARS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

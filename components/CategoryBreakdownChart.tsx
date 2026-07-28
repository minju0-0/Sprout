"use client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import type { BudgetCategory } from "@/types";
import { plantTypeMap } from "@/constants/gardenAssets";
import { formatCurrency } from "@/lib/currency";
interface CategoryBreakdownChartProps {
  categories: BudgetCategory[];
  currencyCode: string | null;
}
export function CategoryBreakdownChart({ categories, currencyCode }: CategoryBreakdownChartProps) {
  const data = categories
    .filter((category) => category.spent > 0)
    .map((category) => ({
      name: category.name,
      value: category.spent,
      color: plantTypeMap[category.species]?.stages.thriving.accent ?? "#3f6b3a",
    }));
  if (data.length === 0) {
    return (
      <p className="flex h-[260px] items-center justify-center text-center text-sm text-ink-soft">
        No spending logged yet this season.
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="h-[220px] w-full sm:w-1/2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="60%"
              outerRadius="90%"
              paddingAngle={2}
              stroke="none"
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => formatCurrency(Number(value), currencyCode)}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid rgba(63,107,58,0.15)",
                fontSize: 13,
                fontFamily: "var(--font-body)",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="flex flex-1 flex-col gap-2">
        {data.map((entry) => (
          <li key={entry.name} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2 text-ink">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: entry.color }}
                aria-hidden="true"
              />
              {entry.name}
            </span>
            <span className="font-data text-xs text-ink-soft">
              {formatCurrency(entry.value, currencyCode)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

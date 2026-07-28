"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";
import type { BudgetCategory } from "@/types";
import { formatCurrency } from "@/lib/currency";
interface BudgetVsSpentChartProps {
  categories: BudgetCategory[];
  currencyCode: string | null;
}
const BUDGETED_COLOR = "#5b84a6";
const SPENT_COLOR = "#3f6b3a";
export function BudgetVsSpentChart({ categories, currencyCode }: BudgetVsSpentChartProps) {
  const data = categories.map((category) => ({
    name: category.name,
    Budgeted: category.budgetLimit,
    Spent: category.spent,
  }));
  if (data.length === 0) {
    return (
      <p className="flex h-[260px] items-center justify-center text-center text-sm text-ink-soft">
        Add a category to see budget vs. spent.
      </p>
    );
  }
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(63,107,58,0.12)" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: "#5c6152" }}
            tickLine={false}
            axisLine={{ stroke: "rgba(63,107,58,0.15)" }}
            interval={0}
            angle={data.length > 4 ? -20 : 0}
            textAnchor={data.length > 4 ? "end" : "middle"}
            height={data.length > 4 ? 48 : 24}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#5c6152" }}
            tickLine={false}
            axisLine={false}
            width={48}
            tickFormatter={(value: number) => formatCurrency(value, currencyCode)}
          />
          <Tooltip
            formatter={(value) => formatCurrency(Number(value), currencyCode)}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid rgba(63,107,58,0.15)",
              fontSize: 13,
              fontFamily: "var(--font-body)",
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="Budgeted" fill={BUDGETED_COLOR} radius={[4, 4, 0, 0]} />
          <Bar dataKey="Spent" fill={SPENT_COLOR} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

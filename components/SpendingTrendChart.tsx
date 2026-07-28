"use client";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";
import type { BudgetCategory, HarvestRecord } from "@/types";
import { formatCurrency } from "@/lib/currency";
interface SpendingTrendChartProps {
  harvests: HarvestRecord[];
  currentSeason: string;
  currentCategories: BudgetCategory[];
  currencyCode: string | null;
}
const BUDGETED_COLOR = "#5b84a6";
const SPENT_COLOR = "#3f6b3a";
const MAX_SEASONS_SHOWN = 6;
function shortSeasonLabel(season: string): string {
  const [month, year] = season.split(" ");
  if (!month || !year) return season;
  return `${month.slice(0, 3)} '${year.slice(2)}`;
}
function totals(categories: BudgetCategory[]) {
  return categories.reduce(
    (acc, category) => ({
      budgeted: acc.budgeted + category.budgetLimit,
      spent: acc.spent + category.spent,
    }),
    { budgeted: 0, spent: 0 },
  );
}
export function SpendingTrendChart({
  harvests,
  currentSeason,
  currentCategories,
  currencyCode,
}: SpendingTrendChartProps) {
  const chronological = [...harvests].reverse();
  const past = chronological.map((harvest) => ({
    season: shortSeasonLabel(harvest.season),
    ...totals(harvest.categories),
  }));
  const current = {
    season: `${shortSeasonLabel(currentSeason)} (current)`,
    ...totals(currentCategories),
  };
  const data = [...past, current].slice(-MAX_SEASONS_SHOWN);
  if (data.length < 2) {
    return (
      <p className="flex h-[260px] items-center justify-center text-center text-sm text-ink-soft">
        Finish a few seasons with &ldquo;Harvest Season&rdquo; to see a trend here.
      </p>
    );
  }
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(63,107,58,0.12)" vertical={false} />
          <XAxis
            dataKey="season"
            tick={{ fontSize: 11, fill: "#5c6152" }}
            tickLine={false}
            axisLine={{ stroke: "rgba(63,107,58,0.15)" }}
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
          <Line
            type="monotone"
            dataKey="budgeted"
            name="Budgeted"
            stroke={BUDGETED_COLOR}
            strokeWidth={2}
            dot={{ r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="spent"
            name="Spent"
            stroke={SPENT_COLOR}
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

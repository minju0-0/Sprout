// lib/upcomingBills.ts
import type { Transaction } from "@/types";
import { getLocalDateString } from "@/lib/transactions";
export interface UpcomingBillsResult {
  upcoming: Transaction[];
  posted: Transaction[];
}
export function getUpcomingBills(
  transactions: Transaction[],
  today: Date = new Date(),
): UpcomingBillsResult {
  const todayStr = getLocalDateString(today);
  const recurring = transactions.filter((transaction) => transaction.isRecurring);
  const upcoming = recurring
    .filter((transaction) => transaction.date > todayStr)
    .sort((a, b) => a.date.localeCompare(b.date));
  const posted = recurring
    .filter((transaction) => transaction.date <= todayStr)
    .sort((a, b) => b.date.localeCompare(a.date));
  return { upcoming, posted };
}
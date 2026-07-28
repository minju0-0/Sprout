import type { Transaction } from "@/types";
export interface UpcomingBillsResult {
  upcoming: Transaction[];
  posted: Transaction[];
}
function todayIso(today: Date): string {
  return today.toISOString().slice(0, 10);
}
export function getUpcomingBills(
  transactions: Transaction[],
  today: Date = new Date(),
): UpcomingBillsResult {
  const todayStr = todayIso(today);
  const recurring = transactions.filter((transaction) => transaction.isRecurring);
  const upcoming = recurring
    .filter((transaction) => transaction.date > todayStr)
    .sort((a, b) => a.date.localeCompare(b.date));
  const posted = recurring
    .filter((transaction) => transaction.date <= todayStr)
    .sort((a, b) => b.date.localeCompare(a.date));
  return { upcoming, posted };
}

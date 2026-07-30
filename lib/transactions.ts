// lib/transactions.ts
import type { Transaction } from "@/types";
export function sortByDateDesc(transactions: Transaction[]): Transaction[] {
  return [...transactions].sort((a, b) => b.date.localeCompare(a.date));
}
export function formatDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`);
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
}
/**
 * Returns a YYYY-MM-DD string built from LOCAL calendar fields, not UTC.
 * `date.toISOString().slice(0, 10)` converts to UTC first, which silently
 * rolls the date back a day for anyone in a positive UTC offset (e.g.
 * UTC+8) during the early hours of the morning. Use this instead whenever
 * you want "today" (or any Date) as the user sees it on their own calendar.
 */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
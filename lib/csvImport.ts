import type { BudgetCategory, Transaction } from "@/types";
export type CsvField = "date" | "description" | "amount" | "category";
export interface CsvColumnMapping {
  date: number | null;
  description: number | null;
  amount: number | null;
  category: number | null;
}
export interface ParsedImportRow {
  rowIndex: number;
  raw: string[];
  date: string | null;
  description: string;
  amount: number | null;
  categoryName: string | null;
  categoryId: string | null;
  error: string | null;
}
const FIELD_KEYWORDS: Record<CsvField, string[]> = {
  date: ["date", "posted", "transaction date"],
  description: ["description", "desc", "memo", "payee", "merchant", "name"],
  amount: ["amount", "amt", "value", "total", "price", "debit"],
  category: ["category", "envelope", "tag", "type"],
};
export function parseCsvText(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  const source = text.replace(/\r\n/g, "\n");
  for (let i = 0; i < source.length; i++) {
    const char = source[i];
    if (inQuotes) {
      if (char === '"') {
        if (source[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }
    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((cells) => cells.some((cell) => cell.trim() !== ""));
}
/** Best-effort guess at which CSV column holds each field, based on header
 * text. Returns null for any field it can't confidently guess — the user
 * confirms or corrects every guess before anything is imported. */
export function guessColumnMapping(header: string[]): CsvColumnMapping {
  const normalized = header.map((cell) => cell.trim().toLowerCase());
  function findColumn(field: CsvField): number | null {
    const keywords = FIELD_KEYWORDS[field];
    const index = normalized.findIndex((cell) =>
      keywords.some((keyword) => cell.includes(keyword)),
    );
    return index === -1 ? null : index;
  }
  return {
    date: findColumn("date"),
    description: findColumn("description"),
    amount: findColumn("amount"),
    category: findColumn("category"),
  };
}
export function normalizeDate(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const slashMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (slashMatch) {
    const [, m, d, y] = slashMatch;
    const year = y.length === 2 ? `20${y}` : y;
    const month = m.padStart(2, "0");
    const day = d.padStart(2, "0");
    const candidate = `${year}-${month}-${day}`;
    return Number.isNaN(Date.parse(candidate)) ? null : candidate;
  }
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10);
}
export function normalizeAmount(raw: string): number | null {
  let trimmed = raw.trim();
  if (!trimmed) return null;
  let negative = false;
  if (/^\(.*\)$/.test(trimmed)) {
    negative = true;
    trimmed = trimmed.slice(1, -1);
  }
  if (trimmed.startsWith("-")) {
    negative = true;
  }
  const cleaned = trimmed.replace(/[^0-9.]/g, "");
  if (!cleaned) return null;
  const value = Number(cleaned);
  if (!Number.isFinite(value) || value === 0) return null;
  void negative;
  return Math.abs(value);
}
function matchCategory(name: string, categories: BudgetCategory[]): BudgetCategory | null {
  const term = name.trim().toLowerCase();
  if (!term) return null;
  return (
    categories.find((category) => category.name.trim().toLowerCase() === term) ??
    categories.find((category) => category.name.trim().toLowerCase().includes(term)) ??
    null
  );
}
/** Parses every data row (all rows after the header) into a candidate
 * transaction, given the user-confirmed column mapping. Rows with an
 * unparseable date/amount get an `error` and are excluded from import;
 * rows with no category match are still returned (with `categoryId: null`)
 * so the caller can offer a fallback category. */
export function buildImportRows(
  dataRows: string[][],
  mapping: CsvColumnMapping,
  categories: BudgetCategory[],
): ParsedImportRow[] {
  return dataRows.map((raw, index) => {
    const dateCell = mapping.date !== null ? (raw[mapping.date] ?? "") : "";
    const descriptionCell =
      mapping.description !== null ? (raw[mapping.description] ?? "") : "";
    const amountCell = mapping.amount !== null ? (raw[mapping.amount] ?? "") : "";
    const categoryCell = mapping.category !== null ? (raw[mapping.category] ?? "") : "";
    const date = normalizeDate(dateCell);
    const amount = normalizeAmount(amountCell);
    const description = descriptionCell.trim() || "Imported transaction";
    const matched = matchCategory(categoryCell, categories);
    let error: string | null = null;
    if (!date) error = "Unrecognized date";
    else if (amount === null) error = "Unrecognized amount";
    return {
      rowIndex: index,
      raw,
      date,
      description,
      amount,
      categoryName: categoryCell.trim() || null,
      categoryId: matched?.id ?? null,
      error,
    };
  });
}
export function toImportableTransactions(
  rows: ParsedImportRow[],
  fallbackCategoryId: string | null,
): Omit<Transaction, "id">[] {
  const result: Omit<Transaction, "id">[] = [];
  for (const row of rows) {
    if (row.error || !row.date || row.amount === null) continue;
    const categoryId = row.categoryId ?? fallbackCategoryId;
    if (!categoryId) continue;
    result.push({
      categoryId,
      description: row.description,
      amount: row.amount,
      date: row.date,
      isRecurring: false,
    });
  }
  return result;
}

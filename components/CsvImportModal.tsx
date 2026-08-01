"use client";
import { useMemo, useState, type ChangeEvent } from "react";
import { AlertTriangle, Check, Upload, X } from "lucide-react";
import type { BudgetCategory, Transaction } from "@/types";
import {
  buildImportRows,
  guessColumnMapping,
  parseCsvText,
  toImportableTransactions,
  type CsvColumnMapping,
} from "@/lib/csvImport";
import { isDateInSeason } from "@/lib/seasonLogic";
import { formatCurrency } from "@/lib/currency";
type Step = "upload" | "map" | "preview";
interface CsvImportModalProps {
  categories: BudgetCategory[];
  currencyCode: string | null;
  activeSeason: string;
  onClose: () => void;
  onImport: (transactions: Omit<Transaction, "id">[]) => void;
}
const FIELD_LABELS: { key: keyof CsvColumnMapping; label: string }[] = [
  { key: "date", label: "Date" },
  { key: "description", label: "Description" },
  { key: "amount", label: "Amount" },
  { key: "category", label: "Category" },
];
const EXAMPLE_CSV = `Date,Description,Amount,Category
2026-07-05,Coffee at Blue Bottle,4.50,Dining
2026-07-06,Whole Foods groceries,62.18,Groceries
2026-07-08,Electric bill,88.00,Utilities
2026-07-10,Refund - returned shoes,(45.00),Shopping`;
export function CsvImportModal({
  categories,
  currencyCode,
  activeSeason,
  onClose,
  onImport,
}: CsvImportModalProps) {
  const [step, setStep] = useState<Step>("upload");
  const [pasteText, setPasteText] = useState("");
  const [fileError, setFileError] = useState<string | null>(null);
  const [rows, setRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<CsvColumnMapping>({
    date: null,
    description: null,
    amount: null,
    category: null,
  });
  const [fallbackCategoryId, setFallbackCategoryId] = useState(categories[0]?.id ?? "");
  const header = rows[0] ?? [];
  const dataRows = useMemo(() => rows.slice(1), [rows]);
  const previewRows = useMemo(
    () => (step === "preview" ? buildImportRows(dataRows, mapping, categories) : []),
    [step, dataRows, mapping, categories],
  );
  const importable = useMemo(
    () => toImportableTransactions(previewRows, fallbackCategoryId || null),
    [previewRows, fallbackCategoryId],
  );
  const errorCount = previewRows.filter((row) => row.error).length;
  const unmatchedCount = previewRows.filter(
    (row) => !row.error && row.categoryId === null,
  ).length;
  const outOfSeasonCount = previewRows.filter(
    (row) => !row.error && row.date && !isDateInSeason(row.date, activeSeason),
  ).length;
  function parseText(text: string) {
    const parsed = parseCsvText(text);
    if (parsed.length < 2) {
      setFileError("Couldn't find a header row and at least one data row.");
      return;
    }
    setRows(parsed);
    setMapping(guessColumnMapping(parsed[0]));
    setFileError(null);
    setStep("map");
  }
  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    parseText(text);
  }
  function handleMappingContinue() {
    if (mapping.date === null || mapping.amount === null) {
      setFileError("Map at least a date column and an amount column to continue.");
      return;
    }
    setFileError(null);
    setStep("preview");
  }
  function handleConfirmImport() {
    if (importable.length === 0) return;
    onImport(importable);
  }
  function handleUseExample() {
    setPasteText(EXAMPLE_CSV);
  }
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="csv-import-title"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-3xl bg-card p-6 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 id="csv-import-title" className="font-display text-lg text-ink">
              Import transactions from CSV
            </h2>
            <p className="text-xs text-ink-soft">
              {step === "upload" && "Bring in transactions you've already tracked elsewhere."}
              {step === "map" && "Confirm which column is which — nothing imports yet."}
              {step === "preview" && "Review before anything is added to the garden."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1 text-ink-soft transition-colors hover:bg-moss/10 hover:text-ink active:bg-moss/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {step === "upload" && (
            <div className="flex flex-col gap-4">
              <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-moss/25 bg-canvas px-6 py-8 text-center transition-colors hover:bg-moss/5">
                <Upload className="h-6 w-6 text-moss" aria-hidden="true" />
                <span className="text-sm font-semibold text-ink">Choose a CSV file</span>
                <span className="text-xs text-ink-soft">
                  Exported from your bank, or any spreadsheet with a header row.
                </span>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileChange}
                  className="sr-only"
                />
              </label>
              <div className="flex items-center gap-2 text-xs text-ink-soft">
                <div className="h-px flex-1 bg-moss/15" />
                or paste CSV text
                <div className="h-px flex-1 bg-moss/15" />
              </div>
              <textarea
                value={pasteText}
                onChange={(event) => setPasteText(event.target.value)}
                rows={5}
                placeholder={"Date,Description,Amount,Category\n2026-01-05,Coffee,4.50,Groceries"}
                className="w-full rounded-lg border border-moss/20 bg-canvas px-3 py-2 font-data text-xs text-ink"
              />
              {}
              <div className="rounded-2xl border border-moss/15 bg-canvas p-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-ink">Expected format</p>
                  <button
                    type="button"
                    onClick={handleUseExample}
                    className="rounded-lg border border-moss/20 bg-card px-2.5 py-1 text-[11px] font-semibold text-moss transition-colors hover:bg-moss/10"
                  >
                    Try this example
                  </button>
                </div>
                <pre className="overflow-x-auto rounded-lg bg-card px-3 py-2 font-data text-[11px] leading-relaxed text-ink-soft">
{EXAMPLE_CSV}
                </pre>
                <ul className="mt-3 flex flex-col gap-1.5 text-[11px] text-ink-soft">
                  <li>
                    <strong className="text-ink">First row is the header</strong> — column names
                    don&apos;t need to match exactly (we guess <em>Date</em>, <em>Description</em>,{" "}
                    <em>Amount</em>, <em>Category</em> from common variants like &quot;Memo&quot;,
                    &quot;Payee&quot;, or &quot;Debit&quot;), and you&apos;ll confirm or correct the
                    guess on the next step regardless.
                  </li>
                  <li>
                    <strong className="text-ink">Date</strong> — accepts{" "}
                    <span className="font-data">YYYY-MM-DD</span> or{" "}
                    <span className="font-data">M/D/YYYY</span>. Rows with an unrecognized date are
                    skipped and listed as errors before anything imports.
                  </li>
                  <li>
                    <strong className="text-ink">Amount</strong> — a plain positive number is
                    treated as spending. A refund or credit can be written as{" "}
                    <span className="font-data">-45.00</span> or{" "}
                    <span className="font-data">(45.00)</span> and is imported as money added back
                    to the category, same as an in-app &quot;refund/credit&quot; transaction.
                    Currency symbols and commas (e.g. <span className="font-data">$1,234.56</span>
                    ) are stripped automatically.
                  </li>
                  <li>
                    <strong className="text-ink">Category</strong> — matched by name
                    (case-insensitive) against your existing categories. Anything that
                    doesn&apos;t match falls back to a category you pick on the review step, so no
                    row is silently dropped for an unrecognized category name.
                  </li>
                  <li>
                    <strong className="text-ink">Description </strong> (is optional) — a blank cell
                    imports as &quot;Imported transaction&quot;.
                  </li>
                </ul>
              </div>
              {fileError && (
                <p className="flex items-center gap-1.5 text-xs text-rust">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  {fileError}
                </p>
              )}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg px-3 py-1.5 text-sm font-semibold text-ink-soft transition-colors hover:bg-moss/10 active:bg-moss/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => parseText(pasteText)}
                  disabled={!pasteText.trim()}
                  className="rounded-lg bg-moss px-4 py-1.5 text-sm font-semibold text-canvas transition-colors hover:bg-moss-light active:bg-moss-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss disabled:opacity-60"
                >
                  Continue
                </button>
              </div>
            </div>
          )}
          {step === "map" && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {FIELD_LABELS.map(({ key, label }) => (
                  <div key={key} className="flex flex-col gap-1">
                    <label htmlFor={`map-${key}`} className="text-xs text-ink-soft">
                      {label}
                      {(key === "date" || key === "amount") && (
                        <span className="text-rust"> *</span>
                      )}
                    </label>
                    <select
                      id={`map-${key}`}
                      value={mapping[key] ?? ""}
                      onChange={(event) =>
                        setMapping((prev) => ({
                          ...prev,
                          [key]: event.target.value === "" ? null : Number(event.target.value),
                        }))
                      }
                      className="rounded-lg border border-moss/20 bg-canvas px-2 py-1.5 text-sm text-ink"
                    >
                      <option value="">Not in file</option>
                      {header.map((column, index) => (
                        <option key={index} value={index}>
                          {column || `Column ${index + 1}`}
                        </option>
                      ))}
                    </select>
                    {mapping[key] !== null && dataRows[0]?.[mapping[key] as number] && (
                      <span className="truncate font-data text-xs text-ink-soft">
                        e.g. {dataRows[0][mapping[key] as number]}
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-ink-soft">
                {dataRows.length} row{dataRows.length === 1 ? "" : "s"} found. Date and Amount are
                required — Description and Category are optional.
              </p>
              {fileError && (
                <p className="flex items-center gap-1.5 text-xs text-rust">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  {fileError}
                </p>
              )}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setStep("upload")}
                  className="rounded-lg px-3 py-1.5 text-sm font-semibold text-ink-soft transition-colors hover:bg-moss/10 active:bg-moss/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleMappingContinue}
                  className="rounded-lg bg-moss px-4 py-1.5 text-sm font-semibold text-canvas transition-colors hover:bg-moss-light active:bg-moss-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
                >
                  Continue
                </button>
              </div>
            </div>
          )}
          {step === "preview" && (
            <div className="flex flex-col gap-4">
              {categories.length > 0 && (
                <div className="flex flex-col gap-1">
                  <label htmlFor="fallback-category" className="text-xs text-ink-soft">
                    Category for unmatched rows {unmatchedCount > 0 && `(${unmatchedCount})`}
                  </label>
                  <select
                    id="fallback-category"
                    value={fallbackCategoryId}
                    onChange={(event) => setFallbackCategoryId(event.target.value)}
                    className="rounded-lg border border-moss/20 bg-canvas px-2 py-1.5 text-sm text-ink sm:max-w-xs"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="max-h-64 overflow-y-auto rounded-2xl border border-moss/15">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-card">
                    <tr className="text-ink-soft uppercase">
                      <th className="px-3 py-2">Date</th>
                      <th className="px-3 py-2">Description</th>
                      <th className="px-3 py-2 text-right">Amount</th>
                      <th className="px-3 py-2">Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.map((row) => {
                      const outOfSeason =
                        !row.error && row.date && !isDateInSeason(row.date, activeSeason);
                      return (
                        <tr key={row.rowIndex} className="border-t border-moss/10">
                          <td className="px-3 py-1.5 font-data text-ink-soft">
                            <span className="inline-flex items-center gap-1">
                              {row.date ?? row.raw[mapping.date ?? -1] ?? "—"}
                              {outOfSeason && (
                                <span
                                  title={`Outside ${activeSeason} — won't count toward this season's budget`}
                                >
                                  <AlertTriangle
                                    className="h-3 w-3 shrink-0 text-marigold-700"
                                    aria-hidden="true"
                                  />
                                </span>
                              )}
                            </span>
                          </td>
                          <td className="max-w-[160px] truncate px-3 py-1.5 text-ink-soft">
                            {row.description}
                          </td>
                          <td className="px-3 py-1.5 text-right font-data text-ink">
                            {row.amount !== null ? formatCurrency(row.amount, currencyCode) : "—"}
                          </td>
                          <td className="px-3 py-1.5">
                            {row.error ? (
                              <span className="inline-flex items-center gap-1 text-rust">
                                <AlertTriangle className="h-3 w-3 shrink-0" aria-hidden="true" />
                                {row.error}
                              </span>
                            ) : row.categoryId ? (
                              <span className="inline-flex items-center gap-1 text-moss">
                                <Check className="h-3 w-3 shrink-0" aria-hidden="true" />
                                {categories.find((c) => c.id === row.categoryId)?.name}
                              </span>
                            ) : (
                              <span className="text-ink-soft">Uses fallback</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-ink-soft">
                {importable.length} of {previewRows.length} row
                {previewRows.length === 1 ? "" : "s"} ready to import
                {errorCount > 0 &&
                  ` — ${errorCount} skipped due to unrecognized date or amount.`}
                {outOfSeasonCount > 0 &&
                  ` ${outOfSeasonCount} fall${outOfSeasonCount === 1 ? "s" : ""} outside ${activeSeason} and won't count toward this season's budget until harvested.`}
              </p>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setStep("map")}
                  className="rounded-lg px-3 py-1.5 text-sm font-semibold text-ink-soft transition-colors hover:bg-moss/10 active:bg-moss/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleConfirmImport}
                  disabled={importable.length === 0}
                  className="rounded-lg bg-moss px-4 py-1.5 text-sm font-semibold text-canvas transition-colors hover:bg-moss-light active:bg-moss-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss disabled:opacity-60"
                >
                  Import {importable.length} transaction{importable.length === 1 ? "" : "s"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
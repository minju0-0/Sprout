"use client";
import { useId } from "react";
import { COMMON_CURRENCIES, getCurrencyLabel } from "@/lib/currency";
interface CurrencySelectorProps {
  value: string;
  onChange: (currencyCode: string) => void;
  label?: string;
}
export function CurrencySelector({ value, onChange, label = "Currency" }: CurrencySelectorProps) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs text-ink-soft">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-lg border border-moss/20 bg-canvas px-3 py-2 text-sm text-ink"
      >
        {COMMON_CURRENCIES.map((code) => (
          <option key={code} value={code}>
            {getCurrencyLabel(code)}
          </option>
        ))}
      </select>
    </div>
  );
}

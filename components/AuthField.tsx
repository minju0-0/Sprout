"use client";
import { cn } from "@/lib/cn";
interface AuthFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
  error?: string;
  placeholder?: string;
}
export function AuthField({
  id,
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
  error,
  placeholder,
}: AuthFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-semibold tracking-wide text-ink-soft uppercase">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        className={cn(
          "rounded-lg border bg-canvas px-3 py-2 text-sm text-ink outline-none transition-colors focus:ring-2 focus:ring-moss/20",
          error ? "border-rust/50 focus:border-rust/60" : "border-moss/20 focus:border-moss/40",
        )}
      />
      {error && <p className="text-xs text-rust">{error}</p>}
    </div>
  );
}
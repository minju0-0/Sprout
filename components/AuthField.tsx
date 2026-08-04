"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { authErrorTextClass, authInputClass, authLabelClass } from "@/lib/authStyles";

interface AuthFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
  error?: string;
  placeholder?: string;
  /** Small helper copy shown beneath the field when there's no error. */
  hint?: string;
  /** "code" centers + widens tracking for one-time verification codes. */
  variant?: "default" | "code";
  inputMode?: "text" | "numeric" | "email";
  maxLength?: number;
  /** Optional leading icon (e.g. a lucide-react Mail or Lock glyph). */
  icon?: ReactNode;
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
  hint,
  variant = "default",
  inputMode,
  maxLength,
  icon,
}: AuthFieldProps) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";
  const resolvedType = isPassword ? (visible ? "text" : "password") : type;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={authLabelClass}>
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft/50"
            aria-hidden="true"
          >
            {icon}
          </span>
        )}
        <input
          id={id}
          name={id}
          type={resolvedType}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          placeholder={placeholder}
          inputMode={inputMode}
          maxLength={maxLength}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={authInputClass(Boolean(error), variant, isPassword, Boolean(icon))}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-semibold uppercase tracking-wide text-ink-soft/70 transition-colors hover:text-moss"
            aria-label={visible ? "Hide password" : "Show password"}
          >
            {visible ? "Hide" : "Show"}
          </button>
        )}
      </div>
      <AnimatePresence mode="wait" initial={false}>
        {error ? (
          <motion.p
            key="error"
            id={`${id}-error`}
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            transition={{ duration: 0.18 }}
            className={authErrorTextClass}
          >
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0" fill="none" aria-hidden="true">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.4" />
              <path d="M8 4.5v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              <circle cx="8" cy="11" r="0.9" fill="currentColor" />
            </svg>
            {error}
          </motion.p>
        ) : hint ? (
          <p id={`${id}-hint`} className="text-xs text-ink-soft/60">
            {hint}
          </p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
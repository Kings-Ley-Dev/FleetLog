import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FieldWrapProps {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function FieldWrap({ label, hint, error, required, children, className }: FieldWrapProps) {
  return (
    <label className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <span className="text-sm font-medium text-ink">
          {label}
          {required && <span className="text-rose"> *</span>}
        </span>
      )}
      {children}
      {error ? (
        <span className="text-xs font-medium text-rose">{error}</span>
      ) : hint ? (
        <span className="text-xs text-slate">{hint}</span>
      ) : null}
    </label>
  );
}

const baseControl =
  "w-full rounded-lg border border-line bg-panel px-3.5 py-2.5 text-sm text-ink placeholder:text-slate-soft transition-colors focus:border-emerald focus:outline-none focus:ring-2 focus:ring-emerald/15 disabled:bg-cream disabled:text-slate-soft";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  mono?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, required, className, mono, ...props }, ref) => (
    <FieldWrap label={label} hint={hint} error={error} required={required}>
      <input
        ref={ref}
        className={cn(baseControl, mono && "tabular", error && "border-rose focus:border-rose focus:ring-rose/15", className)}
        {...props}
      />
    </FieldWrap>
  )
);
Input.displayName = "Input";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, hint, error, required, className, ...props }, ref) => (
    <FieldWrap label={label} hint={hint} error={error} required={required}>
      <textarea
        ref={ref}
        className={cn(baseControl, "min-h-24 resize-y", error && "border-rose focus:border-rose focus:ring-rose/15", className)}
        {...props}
      />
    </FieldWrap>
  )
);
Textarea.displayName = "Textarea";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, hint, error, required, className, children, ...props }, ref) => (
    <FieldWrap label={label} hint={hint} error={error} required={required}>
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            baseControl,
            "appearance-none pr-9",
            error && "border-rose focus:border-rose focus:ring-rose/15",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-soft" />
      </div>
    </FieldWrap>
  )
);
Select.displayName = "Select";

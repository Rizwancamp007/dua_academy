import { InputHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col space-y-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-text/80 cursor-pointer"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={twMerge(
            clsx(
              "flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text/40 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all",
              error && "border-red-500 focus:ring-red-500/50",
              className
            )
          )}
          {...props}
        />
        {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
      </div>
    );
  }
);

Input.displayName = "Input";

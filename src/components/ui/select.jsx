import * as React from "react";
import { cn } from "@/lib/utils";

function Select({ value, onChange, className, children, ...props }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "h-9 w-full rounded-lg border border-border bg-white px-3 py-1 text-sm text-foreground",
        "appearance-none cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:border-blue-400",
        "transition-colors duration-150",
        "bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")] bg-no-repeat bg-[right_10px_center] pr-8",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export { Select };

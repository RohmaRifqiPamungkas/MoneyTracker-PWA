import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        secondary: "bg-[var(--muted)] text-[var(--muted-foreground)]",
        destructive: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
        outline: "border border-[var(--card-border)] text-[var(--foreground)]",
        income: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        expense: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
        warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
        info: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };

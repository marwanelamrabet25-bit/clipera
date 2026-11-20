import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const badgeStyles = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-caption font-medium [&_svg]:size-3.5",
  {
    variants: {
      tone: {
        neutral: "border-line-strong bg-elevated text-muted",
        primary: "border-primary-line bg-primary-wash text-primary-soft",
        success: "border-success/25 bg-success-wash text-success",
        warning: "border-warning/25 bg-warning-wash text-warning",
        danger: "border-danger/25 bg-danger-wash text-danger",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export function Badge({
  className,
  tone,
  ...props
}: HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeStyles>) {
  return <span className={cn(badgeStyles({ tone }), className)} {...props} />;
}

import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export const buttonStyles = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium " +
    "transition-[background-color,border-color,color,opacity] duration-150 ease-out-soft " +
    "disabled:pointer-events-none disabled:opacity-45 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-primary-strong text-on-primary hover:bg-primary-hover active:bg-primary-strong",
        secondary: "border border-line-strong bg-elevated text-fg hover:border-primary-line hover:bg-overlay",
        ghost: "text-muted hover:bg-elevated hover:text-fg",
        danger: "border border-danger/30 bg-danger-wash text-danger hover:bg-danger/20",
      },
      size: {
        sm: "h-8 px-3 text-small",
        md: "h-10 px-4 text-small",
        lg: "h-12 px-5 text-body",
        icon: "size-10",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonStyles> & { loading?: boolean };

export function Button({ className, variant, size, loading, disabled, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonStyles({ variant, size }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <Loader2 className="animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

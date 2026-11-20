import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const tones = {
  info: { icon: Info, cls: "border-primary-line bg-primary-wash text-primary-soft" },
  success: { icon: CheckCircle2, cls: "border-success/25 bg-success-wash text-success" },
  warning: { icon: AlertTriangle, cls: "border-warning/25 bg-warning-wash text-warning" },
  danger: { icon: XCircle, cls: "border-danger/25 bg-danger-wash text-danger" },
} as const;

export function Alert({
  tone = "info",
  title,
  children,
  action,
  className,
}: {
  tone?: keyof typeof tones;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  const { icon: Icon, cls } = tones[tone];
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cn("flex gap-3 rounded-md border p-4", cls, className)}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-small font-medium text-fg">{title}</p>
        {children && <div className="mt-1 text-small text-muted">{children}</div>}
      </div>
      {action && <div className="shrink-0 self-center">{action}</div>}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-dashed border-line-strong px-6 py-12 text-center">
      <div className="mb-4 grid size-12 place-items-center rounded-md border border-primary-line bg-primary-wash text-primary-soft [&_svg]:size-5">
        {icon}
      </div>
      <p className="text-h3 font-semibold">{title}</p>
      <p className="mt-1 max-w-sm text-small text-muted">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("animate-pulse rounded-md bg-overlay", className)} />;
}

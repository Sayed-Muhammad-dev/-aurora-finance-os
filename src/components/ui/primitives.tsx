import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/format";

export function Card({
  children,
  className,
  padded = true
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return <section className={cn("card", padded && "card-padded", className)}>{children}</section>;
}

export function CardHeader({
  title,
  subtitle,
  action
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="card-header">
      <div>
        <h2 className="card-title">{title}</h2>
        {subtitle ? <p className="card-subtitle">{subtitle}</p> : null}
      </div>
      {action ? <div className="card-action">{action}</div> : null}
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral"
}: {
  children: ReactNode;
  tone?: "neutral" | "positive" | "warning" | "critical" | "info";
}) {
  return <span className={cn("badge", `badge-${tone}`)}>{children}</span>;
}

export function Button({
  children,
  variant = "primary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}) {
  return (
    <button className={cn("btn", `btn-${variant}`, className)} {...props}>
      {children}
    </button>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton", className)} />;
}

/** Horizontal meter used for budget utilisation and department shares. */
export function Meter({
  value,
  tone = "neutral",
  delayMs = 0
}: {
  value: number;
  tone?: "neutral" | "positive" | "warning" | "critical";
  delayMs?: number;
}) {
  const [width, setWidth] = useState(0);
  const clamped = Math.max(0, Math.min(100, value));

  useEffect(() => {
    const timer = window.setTimeout(() => setWidth(clamped), 60 + delayMs);
    return () => window.clearTimeout(timer);
  }, [clamped, delayMs]);

  return (
    <div className="meter" role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100}>
      <div className={cn("meter-fill", `meter-${tone}`)} style={{ width: `${width}%` }} />
    </div>
  );
}

/** Eases a number up from zero on mount, honouring reduced motion. */
export function useCountUp(target: number, durationMs = 900) {
  const [value, setValue] = useState(0);
  const frame = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(target);
      return;
    }
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1);
      setValue(target * (1 - Math.pow(1 - progress, 3)));
      if (progress < 1) frame.current = requestAnimationFrame(tick);
      else setValue(target);
    };
    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [target, durationMs]);

  return value;
}

export function StatCard({
  label,
  value,
  caption,
  delta,
  invertDelta = false,
  loading = false,
  format
}: {
  label: string;
  value: number;
  caption?: string;
  delta?: number;
  invertDelta?: boolean;
  loading?: boolean;
  format: (value: number) => string;
}) {
  const animated = useCountUp(loading ? 0 : value);
  const good = delta === undefined ? true : invertDelta ? delta <= 0 : delta >= 0;

  return (
    <div className="stat-card">
      <p className="stat-label">{label}</p>
      {loading ? (
        <Skeleton className="skeleton-value" />
      ) : (
        <p className="stat-value">{format(animated)}</p>
      )}
      <div className="stat-foot">
        {delta !== undefined ? (
          <span className={cn("stat-delta", good ? "stat-delta-up" : "stat-delta-down")}>
            {delta > 0 ? "+" : ""}
            {delta.toFixed(1)}%
          </span>
        ) : null}
        {caption ? <span className="stat-caption">{caption}</span> : null}
      </div>
    </div>
  );
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="empty-state">
      <p className="empty-title">{title}</p>
      <p className="empty-body">{body}</p>
      {action ? <div className="empty-action">{action}</div> : null}
    </div>
  );
}

export function Modal({
  open,
  title,
  subtitle,
  onClose,
  children,
  footer
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-scrim" onClick={onClose} role="presentation">
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="modal-head">
          <div>
            <h2 className="modal-title">{title}</h2>
            {subtitle ? <p className="modal-subtitle">{subtitle}</p> : null}
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close dialog">
            ✕
          </button>
        </header>
        <div className="modal-body">{children}</div>
        {footer ? <footer className="modal-foot">{footer}</footer> : null}
      </div>
    </div>
  );
}

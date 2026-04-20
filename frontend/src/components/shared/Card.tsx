import { ReactNode } from "react";

interface CardProps {
  title?: string;
  subtitle?: string;
  rightSlot?: ReactNode;
  className?: string;
  children: ReactNode;
}

export default function Card({ title, subtitle, rightSlot, className = "", children }: CardProps) {
  return (
    <section
      className={`rounded-2xl border border-ink-600/70 bg-ink-800/80 p-5 shadow-card backdrop-blur-sm ${className}`}
    >
      {(title || subtitle || rightSlot) && (
        <header className="mb-4 flex items-start justify-between gap-4">
          <div>
            {title && <h3 className="font-display text-lg font-semibold text-ink-50">{title}</h3>}
            {subtitle && <p className="mt-1 text-sm text-ink-200">{subtitle}</p>}
          </div>
          {rightSlot ? <div>{rightSlot}</div> : null}
        </header>
      )}
      {children}
    </section>
  );
}

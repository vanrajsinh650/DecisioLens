import { ReactNode } from "react";

import TopBar from "@/components/layout/TopBar";

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="relative min-h-screen bg-ink-900 text-ink-50">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-grid-faint bg-[size:32px_32px] opacity-15"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[-240px] h-[420px] bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.14),_transparent_62%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(11,14,20,0.05)_0%,rgba(11,14,20,0.55)_68%,rgba(11,14,20,0.85)_100%)]"
      />

      <TopBar />

      <main className="relative mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}

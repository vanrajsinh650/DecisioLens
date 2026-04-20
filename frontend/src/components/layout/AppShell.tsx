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
        className="pointer-events-none absolute inset-0 bg-grid-faint bg-[size:32px_32px] opacity-20"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[-220px] h-[420px] bg-[radial-gradient(circle,_rgba(124,156,255,0.18),_transparent_60%)]"
      />

      <TopBar />

      <main className="relative mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}

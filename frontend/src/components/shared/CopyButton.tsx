"use client";

import { useState } from "react";

interface CopyButtonProps {
  value: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
}

export default function CopyButton({
  value,
  label = "Copy",
  copiedLabel = "Copied",
  className = "",
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    if (!value) {
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      onClick={onCopy}
      disabled={!value}
      className={`inline-flex items-center gap-1.5 rounded-lg border border-ink-500 bg-ink-700/60 px-3 py-1.5 text-xs font-semibold text-ink-100 transition hover:border-ink-300 hover:text-ink-50 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      <span aria-hidden>{copied ? "✓" : "⧉"}</span>
      {copied ? copiedLabel : label}
    </button>
  );
}

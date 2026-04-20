"use client";

import { useState } from "react";

interface CopyButtonProps {
  value: string;
  label?: string;
}

export default function CopyButton({ value, label = "Copy" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
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
      className="inline-flex rounded-lg border border-ink-500 bg-ink-700/60 px-3 py-1.5 text-xs font-semibold text-ink-100 transition hover:border-ink-300 hover:text-ink-50"
    >
      {copied ? "Copied" : label}
    </button>
  );
}

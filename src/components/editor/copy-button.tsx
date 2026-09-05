"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/**
 * Copies a value and confirms it in place.
 *
 * Project names carry a timestamp, so they are long enough to be worth
 * copying rather than retyping into a `framecraft` command.
 */
export function CopyButton({
  value,
  label,
  className = "",
}: {
  value: string;
  label: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const copy = async (event: React.MouseEvent) => {
    // These sit inside rows that select a project; copying should not.
    event.preventDefault();
    event.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      return; // Clipboard denied or unavailable: leave the label unchanged.
    }
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      type="button"
      aria-label={copied ? `${label} copied` : label}
      title={label}
      onClick={copy}
      className={`flex size-[26px] items-center justify-center rounded-[7px] transition ${
        copied
          ? "text-[#1E9E5A]"
          : "text-[var(--muted)] hover:bg-black/5 hover:text-[var(--ink)]"
      } ${className}`}
    >
      {copied ? (
        <Check className="size-[13px]" />
      ) : (
        <Copy className="size-[13px]" />
      )}
    </button>
  );
}

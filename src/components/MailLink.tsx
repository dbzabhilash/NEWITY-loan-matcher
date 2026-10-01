"use client";
import type { RecommendationInput } from "@/db/recommendations";
import { useState } from "react";

/**
 * A mailto: button. Some setups (no default mail client, embedded browsers) swallow mailto:,
 * so the draft is also copied to the clipboard on click and the label confirms it inline.
 * `log` is posted to /api/recommendations on click — the click is the logged event, delivery is unobservable.
 */
export function MailLink({ href, text: draft, log, children, disabledReason, className }: { href: string; text: string; log?: RecommendationInput; children: React.ReactNode; disabledReason?: string; className?: string }) {
  const [note, setNote] = useState<string | null>(null);
  const base = `flex h-[38px] shrink-0 items-center whitespace-nowrap rounded-full px-[18px] text-[14px] font-semibold leading-4 ${className ?? ""}`;
  if (disabledReason)
    return (
      <span title={disabledReason} className={`${base} cursor-not-allowed bg-green/50 text-ink/60`}>
        {children}
      </span>
    );
  return (
    <a
      href={href}
      className={`${base} ${note ? "bg-ink text-white" : "bg-green text-ink"}`}
      onClick={() => {
        if (log) void fetch("/api/recommendations", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(log), keepalive: true });
        navigator.clipboard?.writeText(draft).then(
          () => setNote("Draft copied · opening mail"),
          () => setNote("Opening mail…"),
        );
        setTimeout(() => setNote(null), 2500);
      }}
    >
      {note ?? children}
    </a>
  );
}

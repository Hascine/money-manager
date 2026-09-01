"use client";

import { useState } from "react";
import { Copy, Check, Share2 } from "lucide-react";
import { useTranslations } from "@/components/language-provider";

export function CopyInviteLink({ url }: { url: string }) {
  const t = useTranslations();
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API can be unavailable (non-HTTPS, permissions) — user can still select-and-copy the text
    }
  }

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ url });
      } catch {
        // user cancelled the share sheet — no action needed
      }
    } else {
      copy();
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 rounded-xl border border-border bg-surface-muted px-3 py-2.5">
        <p className="flex-1 truncate font-mono text-sm text-foreground">{url}</p>
        <button
          type="button"
          onClick={copy}
          aria-label={t.copyLink}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-foreground-muted hover:bg-surface hover:text-foreground"
        >
          {copied ? <Check size={18} className="text-success" /> : <Copy size={18} />}
        </button>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={share}
          className="flex items-center gap-1.5 text-sm font-medium text-brand-from"
        >
          <Share2 size={16} />
          {t.shareLink}
        </button>
        {copied && <span className="text-sm text-success">{t.linkCopied}</span>}
      </div>
    </div>
  );
}

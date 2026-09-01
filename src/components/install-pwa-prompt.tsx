"use client";

import { useSyncExternalStore } from "react";
import { Share, MoreVertical, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/components/language-provider";

type Platform = "ios" | "android" | "other";

interface Status {
  platform: Platform;
  installed: boolean;
  canPrompt: boolean;
}

function detectPlatform(): Platform {
  const ua = navigator.userAgent;
  // iPadOS 13+ reports as "MacIntel" in the UA string — touch points is the
  // only reliable way left to tell it apart from a real Mac.
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (isIOS) return "ios";
  if (/Android/.test(ua)) return "android";
  return "other";
}

function isRunningStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

// Read once, lazily, the first time any component asks — these values are
// fixed for the lifetime of the page except canPrompt, which install()
// flips after consuming the native prompt.
let cached: Status | undefined;
const listeners = new Set<() => void>();

function getSnapshot(): Status {
  if (!cached) {
    cached = {
      platform: detectPlatform(),
      installed: isRunningStandalone(),
      canPrompt: Boolean(window.__deferredInstallPrompt),
    };
  }
  return cached;
}

// Server has no navigator/window — render nothing there and on the first
// client pass, same as the cached snapshot would be.
function getServerSnapshot(): Status | null {
  return null;
}

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  return () => listeners.delete(onStoreChange);
}

function markPromptConsumed() {
  if (cached) cached = { ...cached, canPrompt: false };
  listeners.forEach((notify) => notify());
}

export function InstallPwaPrompt() {
  const t = useTranslations();
  const status = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  async function install() {
    const prompt = window.__deferredInstallPrompt;
    if (!prompt) return;
    await prompt.prompt();
    await prompt.userChoice;
    window.__deferredInstallPrompt = undefined;
    markPromptConsumed();
  }

  // Render nothing until the client-only checks above resolve, rather than
  // guessing and flashing the wrong instructions during hydration.
  if (status === null) return null;
  const { platform, installed, canPrompt } = status;

  if (installed) {
    return (
      <div className="flex w-full items-center gap-2 rounded-xl bg-success/10 px-4 py-3 text-sm font-medium text-success">
        <Check size={18} className="shrink-0" />
        {t.pwaAlreadyInstalled}
      </div>
    );
  }

  if (platform === "ios") {
    return (
      <div className="flex w-full flex-col gap-2 rounded-xl border border-border bg-surface-muted px-4 py-3 text-left text-sm text-foreground">
        <p className="flex items-center gap-2 font-medium">
          <Share size={16} className="shrink-0" />
          {t.pwaIosStep1}
        </p>
        <p className="text-foreground-muted">{t.pwaIosStep2}</p>
      </div>
    );
  }

  if (platform === "android" && canPrompt) {
    return (
      <Button size="lg" onClick={install} className="w-full">
        {t.pwaInstallCta}
      </Button>
    );
  }

  return (
    <div className="flex w-full flex-col gap-2 rounded-xl border border-border bg-surface-muted px-4 py-3 text-left text-sm text-foreground">
      <p className="flex items-center gap-2 font-medium">
        <MoreVertical size={16} className="shrink-0" />
        {t.pwaAndroidFallbackStep1}
      </p>
      <p className="text-foreground-muted">{t.pwaAndroidFallbackStep2}</p>
    </div>
  );
}

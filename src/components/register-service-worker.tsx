"use client";

import { useEffect } from "react";

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

declare global {
  interface Window {
    __deferredInstallPrompt?: BeforeInstallPromptEvent;
  }
}

export function RegisterServiceWorker() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Installability is a progressive enhancement — ignore failures
        // (e.g. unsupported browser, dev environment without HTTPS).
      });
    }

    // Chrome/Android fire this once, early, and expect preventDefault() if
    // you want to trigger the native install prompt later yourself (e.g.
    // from the onboarding tutorial) instead of showing the browser's own
    // mini-infobar immediately. Stashed on window since it can fire before
    // the tutorial page — which needs it — ever mounts.
    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      window.__deferredInstallPrompt = event as BeforeInstallPromptEvent;
    }
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  return null;
}

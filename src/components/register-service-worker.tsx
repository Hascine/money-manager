"use client";

import { useEffect } from "react";

export function RegisterServiceWorker() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Installability is a progressive enhancement — ignore failures
        // (e.g. unsupported browser, dev environment without HTTPS).
      });
    }
  }, []);

  return null;
}

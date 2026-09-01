"use client";

import { createContext, useContext, type ReactNode } from "react";
import { dictionaries, type Dictionary, type Lang } from "@/lib/i18n/dictionaries";

const LanguageContext = createContext<{ lang: Lang; t: Dictionary } | null>(null);

export function LanguageProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  return (
    <LanguageContext.Provider value={{ lang, t: dictionaries[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

/** For Client Components — Server Components should use `getDictionary()` directly. */
export function useTranslations() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useTranslations must be used within LanguageProvider");
  return ctx.t;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx.lang;
}

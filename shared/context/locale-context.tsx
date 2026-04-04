"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { translations, type TranslationKey, type Locale } from "@/shared/i18n/translations";

interface LocaleContextType {
  locale: Locale;
  t: (key: TranslationKey) => string;
  toggleLocale: () => void;
}

const LocaleContext = createContext<LocaleContextType>({
  locale: "zh-HK",
  t: (key) => key,
  toggleLocale: () => {},
});

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>("zh-HK");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("locale");
      if (stored === "zh-HK" || stored === "en") {
        setLocale(stored);
      }
    } catch {}
  }, []);

  const t = (key: TranslationKey): string =>
    (translations[locale] as Record<string, string>)[key] ?? key;

  const toggleLocale = () => {
    setLocale((prev) => {
      const next: Locale = prev === "zh-HK" ? "en" : "zh-HK";
      try {
        localStorage.setItem("locale", next);
      } catch {}
      return next;
    });
  };

  return (
    <LocaleContext.Provider value={{ locale, t, toggleLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}

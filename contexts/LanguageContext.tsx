"use client";

import { createContext, useState, useCallback, type ReactNode } from "react";
import { translate, type Language, type TranslationKey } from "@/lib/i18n";

interface LanguageContextValue {
    language: Language;
    toggleLanguage: () => void;
    setLanguage: (lang: Language) => void;
    t: (key: TranslationKey) => string;
}

export const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>("vn");

    const toggleLanguage = useCallback(() => {
        setLanguageState((prev) => (prev === "vn" ? "en" : "vn"));
    }, []);

    const setLanguage = useCallback((lang: Language) => {
        setLanguageState(lang);
    }, []);

    const t = useCallback(
        (key: TranslationKey) => translate(key, language),
        [language],
    );

    return (
        <LanguageContext.Provider value={{ language, toggleLanguage, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import en from "../locales/en.json";
import gu from "../locales/gu.json";

const LanguageContext = createContext(null);

const translations = { en, gu };

const getValueByKey = (object, key) => {
    return key.split(".").reduce((value, currentKey) => {
        return value?.[currentKey];
    }, object);
};

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem("language") || "en";
    });

    useEffect(() => {
        localStorage.setItem("language", language);
        document.documentElement.lang = language === "gu" ? "gu" : "en";
    }, [language]);

    const t = (key, fallback = "") => {
        const selectedText = getValueByKey(translations[language], key);
        const englishText = getValueByKey(translations.en, key);

        return selectedText || englishText || fallback || key;
    };

    const toggleLanguage = () => {
        setLanguage((previousLanguage) =>
            previousLanguage === "en" ? "gu" : "en"
        );
    };

    const value = useMemo(
        () => ({
            language,
            setLanguage,
            toggleLanguage,
            t,
            isGujarati: language === "gu"
        }),
        [language]
    );

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);

    if (!context) {
        throw new Error("useLanguage must be used inside LanguageProvider.");
    }

    return context;
};
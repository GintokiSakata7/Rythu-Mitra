import { createContext, useContext, useState } from 'react';
import { translations } from '../lib/translations.js';

const LanguageContext = createContext();

export function useLanguage() {
  return useContext(LanguageContext);
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('rythumitra_lang') || null;
  });

  const changeLanguage = (langCode) => {
    setLanguage(langCode);
    localStorage.setItem('rythumitra_lang', langCode);
  };

  const t = (key) => {
    const lang = language || 'en';
    if (translations[lang] && translations[lang][key]) {
      return translations[lang][key];
    }
    return translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

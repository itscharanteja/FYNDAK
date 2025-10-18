import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { LanguageContext } from "../contexts/LanguageContext";

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

// Export a combined hook that provides both language and translation
export const useAppTranslation = () => {
  const { t, i18n } = useTranslation();
  const languageContext = useLanguage();

  return {
    t,
    ...languageContext,
    i18n,
  };
};

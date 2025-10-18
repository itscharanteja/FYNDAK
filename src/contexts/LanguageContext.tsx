import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import i18n from "../lib/i18n";

interface LanguageContextType {
  language: "en" | "sv";
  setLanguage: (lang: "en" | "sv") => void;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

// Export the context for use in hooks
export { LanguageContext };

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
}) => {
  const [language, setLanguageState] = useState<"en" | "sv">(() => {
    // Get language from localStorage or default to 'en'
    const stored = localStorage.getItem("language");
    return stored === "en" || stored === "sv" ? stored : "en";
  });
  const [isLoading, setIsLoading] = useState(false);

  // Update i18n when language changes
  useEffect(() => {
    const changeLanguage = async () => {
      setIsLoading(true);
      try {
        await i18n.changeLanguage(language);
        localStorage.setItem("language", language);
        // Update document language for accessibility
        document.documentElement.lang = language;
      } catch (error) {
        console.error("Failed to change language:", error);
      } finally {
        setIsLoading(false);
      }
    };

    changeLanguage();
  }, [language]);

  const setLanguage = (lang: "en" | "sv") => {
    setLanguageState(lang);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        isLoading,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }

  return {
    language: context.language,
    changeLanguage: context.setLanguage,
    isLoading: context.isLoading,
  };
};

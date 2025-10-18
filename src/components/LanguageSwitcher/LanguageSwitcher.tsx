import React from "react";
import { Globe } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";

export const LanguageSwitcher: React.FC = () => {
  const { language, changeLanguage, isLoading } = useLanguage();

  const handleLanguageToggle = () => {
    const newLanguage = language === "en" ? "sv" : "en";
    changeLanguage(newLanguage);
  };

  return (
    <button
      onClick={handleLanguageToggle}
      disabled={isLoading}
      className="w-12 h-12 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-105 border border-gray-200/50 dark:border-gray-700/50 group"
      aria-label={`Switch to ${language === "en" ? "Swedish" : "English"}`}
    >
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 dark:from-blue-400 dark:to-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 relative">
        <Globe className="w-4 h-4 text-white" />
        <span className="absolute -bottom-1 -right-1 text-[10px] font-bold text-white bg-black/50 rounded-full px-1 leading-none">
          {language.toUpperCase()}
        </span>
      </div>
    </button>
  );
};

import React from "react";
import { Globe } from "lucide-react";
import { useLanguage } from "../hooks/useLanguage";

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage, isLoading } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "sv" : "en");
  };

  return (
    <button
      onClick={toggleLanguage}
      disabled={isLoading}
      className="w-10 h-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-105 border border-gray-200/50 dark:border-gray-700/50 group relative"
      title={language === "en" ? "Switch to Swedish" : "Växla till engelska"}
    >
      <div className="relative">
        <Globe className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300" />

        {/* Language indicator */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full flex items-center justify-center">
          <span className="text-[8px] font-bold text-white">
            {language === "en" ? "EN" : "SV"}
          </span>
        </div>

        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 border border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Tooltip */}
      <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
        {language === "en" ? "Svenska" : "English"}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
      </div>
    </button>
  );
};

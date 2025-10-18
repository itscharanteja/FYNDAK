import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  Home,
  Package,
  User,
  Settings,
  Gavel,
  Sun,
  Moon,
  Info,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { LanguageSwitcher } from "../LanguageSwitcher";
import { useAppTranslation } from "../../hooks/useLanguage";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, profile, authLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t } = useAppTranslation();
  const location = useLocation();

  // Define navigation items based on authentication status
  const publicNavItems = [
    { id: "home", path: "/", label: t("home"), icon: Home },
    { id: "about", path: "/about", label: t("about"), icon: Info },
  ];

  const authenticatedNavItems = [
    { id: "home", path: "/", label: t("home"), icon: Home },
    { id: "auctions", path: "/products", label: t("auctions"), icon: Gavel },
    {
      id: "dashboard",
      path: "/dashboard",
      label: t("dashboard"),
      icon: Package,
    },
    { id: "about", path: "/about", label: t("about"), icon: Info },
  ];

  // Add admin link if user is admin
  if (profile?.is_admin) {
    authenticatedNavItems.push({
      id: "admin",
      path: "/admin",
      label: t("admin"),
      icon: Settings,
    });
  }

  const navItems = user ? authenticatedNavItems : publicNavItems;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-800 dark:via-gray-900 dark:to-black text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {authLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500"></div>
        </div>
      )}
      <nav className="bg-transparent py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Left side - User Profile or Login (Floating) */}
            <div className="flex items-center">
              {user ? (
                <NavLink to="/profile" className="group">
                  <div className="w-12 h-12 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-105 border border-gray-200/50 dark:border-gray-700/50">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </NavLink>
              ) : (
                <button
                  onClick={() => (window.location.href = "/dashboard")}
                  className="group px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 font-medium"
                >
                  Sign In
                </button>
              )}
            </div>

            {/* Center - Logo and Navigation (Floating) */}
            <div className="flex items-center gap-6">
              {/* Logo */}
              <NavLink to="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">
                  Fyndak
                </span>
              </NavLink>

              {/* Navigation Items (Floating Container) */}
              <div className="hidden md:flex items-center bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-lg px-2 py-2 border border-gray-200/50 dark:border-gray-700/50">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <NavLink
                      key={item.id}
                      to={item.path}
                      className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105 ${
                        isActive
                          ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md"
                          : "text-gray-700 hover:bg-gray-100/80 dark:text-gray-300 dark:hover:bg-gray-700/50 hover:shadow-sm"
                      }`}
                    >
                      {item.label}
                    </NavLink>
                  );
                })}
              </div>
            </div>

            {/* Right side - Language & Theme Toggles (Floating) - UPDATED */}
            <div className="flex items-center gap-3">
              <LanguageSwitcher />

              <button
                onClick={toggleTheme}
                className="w-12 h-12 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-105 border border-gray-200/50 dark:border-gray-700/50 group"
                aria-label="Toggle theme"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 dark:from-indigo-400 dark:to-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  {theme === "dark" ? (
                    <Sun className="w-4 h-4 text-white" />
                  ) : (
                    <Moon className="w-4 h-4 text-white" />
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Mobile Navigation (Floating) */}
          <div className="md:hidden mt-4">
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-lg mx-4 px-4 py-3 border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center justify-around">
                {navItems.slice(0, 5).map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    location.pathname === item.path ||
                    (item.id === "home" && location.pathname === "/dashboard");
                  return (
                    <NavLink
                      key={item.id}
                      to={item.path}
                      className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 hover:scale-105 ${
                        isActive
                          ? "text-green-500 bg-green-50 dark:bg-green-900/20"
                          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100/50 dark:hover:bg-gray-700/50"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs font-medium">{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="bg-white border-t border-green-100 dark:bg-gray-800 dark:border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} FYNDAK. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

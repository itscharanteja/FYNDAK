import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Home, Package, User, Settings, Gavel, Sun, Moon } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { profile, authLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const navItems = [
    { id: "dashboard", path: "/dashboard", label: "Dashboard", icon: Home },
    { id: "products", path: "/products", label: "Auctions", icon: Gavel },
    { id: "profile", path: "/profile", label: "Profile", icon: User },
  ];

  if (profile?.is_admin) {
    navItems.push({
      id: "admin",
      path: "/admin",
      label: "Admin",
      icon: Settings,
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-800 dark:via-gray-900 dark:to-black text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {authLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500"></div>
        </div>
      )}
      <nav className="bg-white shadow-lg border-b border-green-100 dark:bg-gray-800 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">FYNDAK</h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">Bidding Platform</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                      isActive
                        ? "bg-green-500 text-white shadow-md"
                        : "text-gray-700 hover:bg-green-50 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </NavLink>
                );
              })}
              <button
                onClick={toggleTheme}
                className="ml-4 p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-300"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
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

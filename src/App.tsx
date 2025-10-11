import React, { useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { LoginForm } from "./components/Auth/LoginForm";
import { SignUpForm } from "./components/Auth/SignUpForm";
import { Layout } from "./components/Layout/Layout";
import { Dashboard } from "./components/Dashboard/Dashboard";
import { ProductsPage } from "./components/Products/ProductsPage";
import { ProfilePage } from "./components/Profile/ProfilePage";
import { AdminPanel } from "./components/Admin/AdminPanel";
import { AboutPage } from "./components/About/AboutPage";
import { SellPage } from "./components/Sell/SellPage";
import { MapPage } from "./components/Map/MapPage";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [showSignUp, setShowSignUp] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-800 dark:to-black">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!user) {
    return showSignUp ? (
      <SignUpForm onToggleForm={() => setShowSignUp(false)} />
    ) : (
      <LoginForm onToggleForm={() => setShowSignUp(true)} />
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/sell" element={<SellPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Layout>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;

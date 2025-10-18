import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Swedish translations
const swedishTranslations = {
  // Navigation
  home: "Hem",
  auctions: "Auktioner",
  dashboard: "Dashboard",
  about: "Om oss",
  sell: "Sälja",
  map: "Karta",
  admin: "Admin",
  profile: "Profil",

  // Authentication
  signIn: "Logga in",
  signUp: "Registrera dig",
  welcome: "Välkommen till FYNDAK",
  "auth.signInSubtitle": "Logga in för att börja bjuda på premiumauktioner",
  "auth.signUpSubtitle":
    "Skapa ditt konto för att börja bjuda på premiumauktioner",
  "auth.email": "E-postadress",
  "auth.password": "Lösenord",
  "auth.fullName": "Fullständigt namn",
  "auth.phone": "Telefon (valfritt)",
  "auth.address": "Adress (valfritt)",
  "auth.signingIn": "Loggar in...",
  "auth.creatingAccount": "Skapar konto...",
  "auth.noAccount": "Har du inget konto?",
  "auth.hasAccount": "Har du redan ett konto?",

  // Homepage
  "hero.title": "Din",
  "hero.titleHighlight": "Nordiska Marknadsplats",
  "hero.subtitle":
    "Upptäck nordiska skatter, vintage-fynd och handgjorda hantverk. Köp, sälj och anslut dig till en gemenskap av skandinaviska entusiaster.",
  "hero.exploreAuctions": "Utforska Auktioner",
  "hero.stats.liveAuctions": "Live-auktioner",
  "hero.stats.happyBuyers": "Nöjda köpare",
  "hero.stats.satisfaction": "Tillfredsställelse",

  // Premium Auctions Section
  "premiumAuctions.title": "Premiumauktioner",
  "premiumAuctions.subtitle":
    "Våra topp 3 högsta värdeauktioner - lyx när den är som bäst",
  "premiumAuctions.noAuctions": "Inga auktioner tillgängliga för tillfället",

  // Why Choose Us Section
  "whyChoose.title": "Varför välja FYNDAK?",
  "whyChoose.subtitle":
    "Gå med i tusentals nöjda användare som litar på FYNDAK för äkta auktioner och premiumföremål",
  "whyChoose.secureTitle": "Säkra transaktioner",
  "whyChoose.secureDesc":
    "Dina betalningar och personlig information skyddas med banknivåsäkerhet.",
  "whyChoose.supportTitle": "24/7 Support",
  "whyChoose.supportDesc":
    "Vårt dedikerade supportteam är alltid här för att hjälpa dig med alla frågor eller problem.",
  "whyChoose.globalTitle": "Global räckvidd",
  "whyChoose.globalDesc":
    "Anslut med köpare och säljare från hela världen och utöka din marknad.",

  // Call to Action Section
  "cta.title": "Redo att börja",
  "cta.titleHighlight": "Sälja",
  "cta.subtitle":
    "Gå med i tusentals entreprenörer som har förvandlat sin passion till vinst på FYNDAK.",
  "cta.startSelling": "Börja sälja idag",
  "cta.dashboard.title": "Sälj-dashboard",
  "cta.dashboard.subtitle": "Hantera dina annonser",
  "cta.dashboard.activeListings": "Aktiva annonser",
  "cta.dashboard.totalSales": "Totala försäljningar",
  "cta.dashboard.thisMonth": "Denna månad",

  // Product Card
  "product.currentBid": "Aktuellt bud",
  "product.timeLeft": "Tid kvar",
  "product.placeBid": "Lägg bud",
  "product.ended": "Avslutad",

  // General
  loading: "Laddar...",
  error: "Fel",
  success: "Framgång",
  cancel: "Avbryt",
  save: "Spara",
  delete: "Ta bort",
  edit: "Redigera",
  close: "Stäng",
};

// English translations
const englishTranslations = {
  // Navigation
  home: "Home",
  auctions: "Auctions",
  dashboard: "Dashboard",
  about: "About",
  sell: "Sell",
  map: "Map",
  admin: "Admin",
  profile: "Profile",

  // Authentication
  signIn: "Sign In",
  signUp: "Sign Up",
  welcome: "Welcome to FYNDAK",
  "auth.signInSubtitle": "Sign in to start bidding on premium auctions",
  "auth.signUpSubtitle":
    "Create your account to start bidding on premium auctions",
  "auth.email": "Email Address",
  "auth.password": "Password",
  "auth.fullName": "Full Name",
  "auth.phone": "Phone (Optional)",
  "auth.address": "Address (Optional)",
  "auth.signingIn": "Signing in...",
  "auth.creatingAccount": "Creating account...",
  "auth.noAccount": "Don't have an account?",
  "auth.hasAccount": "Already have an account?",

  // Homepage
  "hero.title": "Your",
  "hero.titleHighlight": "Nordic Marketplace",
  "hero.subtitle":
    "Discover Nordic treasures, vintage finds, and handmade crafts. Buy, sell, and connect with a community of Scandinavian enthusiasts.",
  "hero.exploreAuctions": "Explore Auctions",
  "hero.stats.liveAuctions": "Live Auctions",
  "hero.stats.happyBuyers": "Happy Buyers",
  "hero.stats.satisfaction": "Satisfaction",

  // Premium Auctions Section
  "premiumAuctions.title": "Premium Auctions",
  "premiumAuctions.subtitle":
    "Our top 3 highest value auctions - luxury at its finest",
  "premiumAuctions.noAuctions": "No featured auctions available at the moment",

  // Why Choose Us Section
  "whyChoose.title": "Why Choose FYNDAK?",
  "whyChoose.subtitle":
    "Join thousands of satisfied users who trust FYNDAK for authentic auctions and premium items",
  "whyChoose.secureTitle": "Secure Transactions",
  "whyChoose.secureDesc":
    "Your payments and personal information are protected with bank-level security.",
  "whyChoose.supportTitle": "24/7 Support",
  "whyChoose.supportDesc":
    "Our dedicated support team is always here to help you with any questions or issues.",
  "whyChoose.globalTitle": "Global Reach",
  "whyChoose.globalDesc":
    "Connect with buyers and sellers from around the world and expand your market.",

  // Call to Action Section
  "cta.title": "Ready to Start",
  "cta.titleHighlight": "Selling",
  "cta.subtitle":
    "Join thousands of entrepreneurs who have turned their passion into profit on FYNDAK.",
  "cta.startSelling": "Start Selling Today",
  "cta.dashboard.title": "Seller Dashboard",
  "cta.dashboard.subtitle": "Manage your listings",
  "cta.dashboard.activeListings": "Active Listings",
  "cta.dashboard.totalSales": "Total Sales",
  "cta.dashboard.thisMonth": "This Month",

  // Product Card
  "product.currentBid": "Current Bid",
  "product.timeLeft": "Time Left",
  "product.placeBid": "Place Bid",
  "product.ended": "Ended",

  // General
  loading: "Loading...",
  error: "Error",
  success: "Success",
  cancel: "Cancel",
  save: "Save",
  delete: "Delete",
  edit: "Edit",
  close: "Close",
};

// Initialize i18n
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: englishTranslations,
      },
      sv: {
        translation: swedishTranslations,
      },
    },
    fallbackLng: "en",
    debug: process.env.NODE_ENV === "development",

    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
    },

    interpolation: {
      escapeValue: false, // React already does escaping
    },
  });

export default i18n;

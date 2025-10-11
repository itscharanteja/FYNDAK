import React, { useState, useEffect } from "react";
import { Heart, MapPin } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";

interface Product {
  id: string;
  name: string;
  description: string;
  image_url: string;
  current_price: number;
  end_time: string;
  category: string;
  location: string;
  condition: string;
  created_at: string;
}

// Why Choose Us data
const whyChooseUs = [
  {
    id: 1,
    icon: "🔒",
    title: "Secure Transactions",
    description:
      "Your payments and personal information are protected with bank-level security.",
  },
  {
    id: 2,
    icon: "🎧",
    title: "24/7 Support",
    description:
      "Our dedicated support team is always here to help you with any questions or issues.",
  },
  {
    id: 3,
    icon: "🌍",
    title: "Global Reach",
    description:
      "Connect with buyers and sellers from around the world and expand your market.",
  },
];

// Product Card Component
const ProductCard: React.FC<{
  product: Product;
  isWished: boolean;
  onToggleWishlist: (product: Product) => void;
  onProductClick?: (product: Product) => void;
}> = ({ product, isWished, onToggleWishlist, onProductClick }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("sv-SE", {
      style: "currency",
      currency: "SEK",
    }).format(price);
  };

  const formatTimeLeft = (endTime: string) => {
    const end = new Date(endTime);
    const now = new Date();
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return "Ended";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  return (
    <div className="group bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden hover:-translate-y-1">
      <div className="relative h-48 overflow-hidden">
        <img
          src={product.image_url || "/api/placeholder/300/200"}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onClick={() => onProductClick?.(product)}
        />
        <button
          onClick={() => onToggleWishlist(product)}
          className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
        >
          <Heart
            className={`w-4 h-4 ${
              isWished ? "text-red-500 fill-current" : "text-gray-600"
            }`}
          />
        </button>
        <div className="absolute bottom-3 left-3">
          <span className="bg-emerald-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
            {product.category}
          </span>
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-2 line-clamp-1">
          {product.name}
        </h3>
        <p className="text-slate-600 dark:text-slate-300 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Current Bid
            </span>
            <div className="text-lg font-bold text-emerald-600">
              {formatPrice(product.current_price)}
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Time Left
            </span>
            <div className="text-sm font-semibold text-orange-500">
              {formatTimeLeft(product.end_time)}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-4">
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {product.location}
          </div>
          <div className="capitalize">{product.condition}</div>
        </div>

        <button className="w-full bg-emerald-600 text-white py-2.5 rounded-lg font-semibold hover:bg-emerald-700 transition-colors">
          Place Bid
        </button>
      </div>
    </div>
  );
};

const Homepage: React.FC = () => {
  const { user } = useAuth();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const isInWishlist = (id: string) => {
    return wishlist.some((item) => item.id === id);
  };

  const onToggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        return prev.filter((item) => item.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);

      // Fetch top 3 highest cost products with images
      const { data: featured, error: featuredError } = await supabase
        .from("products")
        .select("*")
        .not("image_url", "is", null)
        .eq("status", "active")
        .order("current_price", { ascending: false })
        .limit(3);

      if (featuredError) throw featuredError;

      setFeaturedProducts(featured || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section - Floating Design */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-6 py-12">
          {/* Floating Hero Card */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-8 md:p-12 text-center animate-fade-up">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Discover Amazing{" "}
              <span className="text-emerald-600">Auctions</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Join Sweden's premier auction marketplace where unique items find
              their perfect owners. Bid with confidence on authenticated
              products from trusted sellers.
            </p>

            {/* Stats in floating containers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white backdrop-blur-sm border border-emerald-400/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-up animate-delay-200">
                <div className="text-3xl font-bold">
                  {featuredProducts.length}+
                </div>
                <div className="text-emerald-100 text-sm font-medium">
                  Live Auctions
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white backdrop-blur-sm border border-blue-400/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-up animate-delay-300">
                <div className="text-3xl font-bold">50K+</div>
                <div className="text-blue-100 text-sm font-medium">
                  Happy Buyers
                </div>
              </div>
              <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl p-6 text-white backdrop-blur-sm border border-teal-400/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-up animate-delay-400">
                <div className="text-3xl font-bold">99%</div>
                <div className="text-teal-100 text-sm font-medium">
                  Satisfaction
                </div>
              </div>
            </div>

            <button
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold px-8 py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              onClick={() => {
                if (user) {
                  window.location.href = "/products";
                } else {
                  window.location.href = "/dashboard";
                }
              }}
            >
              Explore Auctions
            </button>
          </div>
        </div>
      </section>

      {/* Featured Products - Floating Design */}
      <section className="container mx-auto px-6">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-8 animate-fade-up animate-delay-200">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Premium Auctions
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Our top 3 highest value auctions - luxury at its finest
              </p>
            </div>
          </div>

          {featuredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                No featured auctions available at the moment
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {featuredProducts.map((product, index) => (
                <div
                  key={product.id}
                  className={`animate-fade-up animate-delay-${Math.min(
                    index * 100 + 400,
                    800
                  )}`}
                >
                  <ProductCard
                    product={product}
                    isWished={isInWishlist(product.id)}
                    onToggleWishlist={onToggleWishlist}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us - Floating Design */}
      <section className="container mx-auto px-6">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-8 animate-fade-up animate-delay-300">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose FYNDAK?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Join thousands of satisfied users who trust FYNDAK for authentic
              auctions and premium items
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {whyChooseUs.map((item, index) => (
              <div
                key={item.id}
                className={`group text-center bg-gradient-to-br from-white/70 to-gray-50/70 dark:from-gray-700/70 dark:to-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/30 dark:border-gray-600/30 hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-fade-up animate-delay-${
                  600 + index * 100
                }`}
              >
                <div className="text-5xl mb-4 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action - Floating Design */}
      <section className="container mx-auto px-6">
        <div className="bg-gradient-to-br from-emerald-500/90 to-teal-600/90 backdrop-blur-sm rounded-3xl shadow-xl border border-emerald-400/30 p-8 md:p-12 text-white relative overflow-hidden animate-fade-up animate-delay-500">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 backdrop-blur-sm"></div>

          <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Ready to Start <span className="text-emerald-100">Selling</span>
                ?
              </h2>
              <p className="text-xl text-emerald-50 mb-8 leading-relaxed">
                Join thousands of entrepreneurs who have turned their passion
                into profit on FYNDAK.
              </p>
              <button className="bg-white text-emerald-600 font-bold px-8 py-4 rounded-2xl text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 hover:bg-gray-50">
                Start Selling Today
              </button>
            </div>

            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8 shadow-2xl">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white font-bold border border-white/30">
                    kr
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-lg">
                      Seller Dashboard
                    </h4>
                    <p className="text-emerald-100 text-sm">
                      Manage your listings
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-emerald-100">Active Listings</span>
                    <span className="text-white font-semibold text-lg">12</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-emerald-100">Total Sales</span>
                    <span className="text-white font-semibold text-lg">
                      2,450 kr
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-emerald-100">This Month</span>
                    <span className="text-emerald-200 font-semibold text-lg">
                      +18%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Homepage;

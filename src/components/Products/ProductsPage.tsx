import React, { useEffect, useState } from "react";
import { supabase, Product } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import { Gavel, Clock, Banknote, MapPin, Tag, X, User } from "lucide-react";
import { useAppTranslation } from "../../hooks/useLanguage";

export const ProductsPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useAppTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [bidAmount, setBidAmount] = useState("");
  const [bidding, setBidding] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchProducts();

    const productChannel = supabase
      .channel("products_changes")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "products" },
        (payload) => {
          setProducts((prevProducts) =>
            prevProducts.map((product) =>
              product.id === payload.new.id
                ? { ...product, ...payload.new }
                : product
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(productChannel);
    };
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      const updatedProduct = products.find((p) => p.id === selectedProduct.id);
      if (updatedProduct) {
        setSelectedProduct(updatedProduct);
      }
    }
  }, [products]);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching products:", error);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !user) return;

    setError("");
    setSuccess("");
    setBidding(true);

    const amount = parseFloat(bidAmount);

    if (amount <= selectedProduct.current_price) {
      setError(
        `${t("products.bidHigherThan")} ${formatPrice(
          selectedProduct.current_price
        )}`
      );
      setBidding(false);
      return;
    }

    try {
      const { error: bidError } = await supabase.from("bids").insert([
        {
          product_id: selectedProduct.id,
          bidder_id: user.id,
          amount: amount,
          status: "active",
        },
      ]);

      if (bidError) throw bidError;

      setSuccess(t("products.bidPlacedSuccess"));
      setBidAmount("");
      setSelectedProduct(null);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : t("products.failedToPlaceBid")
      );
    } finally {
      setBidding(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("sv-SE", {
      style: "currency",
      currency: "SEK",
    }).format(price);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return t("products.noEndDate");
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-200">
            {t("products.title")}
          </h1>
        </div>

        {/* Products count */}
        <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200">
          {products.length} {t("products.productsFound")}
        </p>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300 transition-all duration-200">
          {success}
        </div>
      )}

      {products.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-900/20 p-12 text-center transition-colors duration-200">
          <Gavel className="w-16 h-16 text-gray-400 dark:text-gray-500 transition-colors duration-200" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-200">
            {t("products.noActiveAuctions")}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200">
            {t("products.checkBackLater")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product, index) => {
            // Array of beautiful background gradients
            const backgrounds = [
              "bg-gradient-to-br from-amber-200 via-orange-200 to-yellow-200", // Warm browns like ceramic vase
              "bg-gradient-to-br from-gray-200 via-slate-200 to-gray-300", // Neutral like camera
              "bg-gradient-to-br from-yellow-200 via-amber-200 to-orange-200", // Golden like leather wallet
              "bg-gradient-to-br from-rose-100 via-pink-100 to-purple-100", // Soft like abstract art
              "bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100", // Cool tones
              "bg-gradient-to-br from-green-100 via-emerald-100 to-teal-100", // Nature tones
              "bg-gradient-to-br from-pink-100 via-rose-100 to-red-100", // Warm pinks
              "bg-gradient-to-br from-violet-100 via-purple-100 to-indigo-100", // Purple spectrum
            ];

            const cardBg = backgrounds[index % backgrounds.length];

            // Use actual product data or fallback values
            const category = product.category || t("products.uncategorized");
            const location =
              product.location || t("products.locationNotSpecified");

            return (
              <div
                key={product.id}
                className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-gray-900/20 overflow-hidden hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                onClick={() => {
                  setSelectedProduct(product);
                  setBidAmount((product.current_price + 1).toFixed(2));
                  setError("");
                  setSuccess("");
                }}
              >
                {/* Image Container */}
                <div
                  className={`relative h-48 ${cardBg} flex items-center justify-center transition-all duration-300`}
                >
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Gavel className="w-16 h-16 text-gray-400 opacity-50" />
                  )}
                </div>

                {/* Card Content */}
                <div className="p-4">
                  {/* Product Title */}
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-200">
                    {product.name}
                  </h3>

                  {/* Price */}
                  <div className="mb-3">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatPrice(product.current_price)}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                    {product.description ||
                      "A beautiful, one-of-a-kind item for your collection."}
                  </p>

                  {/* Category Tag */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                      <Tag className="w-3 h-3 text-green-600 dark:text-green-400" />
                      <span className="text-xs font-medium text-green-700 dark:text-green-400">
                        {category}
                      </span>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-4">
                    <MapPin className="w-3 h-3 text-red-500" />
                    <span>{location}</span>
                  </div>

                  {/* Time remaining */}
                  {product.end_time && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span>
                        {t("products.ends")} {formatDate(product.end_time)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transition-colors duration-200 animate-in slide-in-from-bottom-4 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header with Close Button */}
            <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-2xl">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-200">
                {t("products.details")}
              </h2>
              <button
                onClick={() => {
                  setSelectedProduct(null);
                  setBidAmount("");
                  setError("");
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors duration-200"
              >
                <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Product Image */}
            <div className="relative h-64 md:h-80 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
              {selectedProduct.image_url ? (
                <img
                  src={selectedProduct.image_url}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Gavel className="w-20 h-20 text-gray-400 dark:text-gray-500" />
                </div>
              )}
            </div>

            {/* Product Information */}
            <div className="p-6 space-y-6">
              {/* Product Title and Current Price */}
              <div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-200">
                  {selectedProduct.name}
                </h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {t("products.currentBid")}:
                    </span>
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {formatPrice(selectedProduct.current_price)}
                    </span>
                  </div>
                  {selectedProduct.end_time && (
                    <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>
                        {t("products.ends")}{" "}
                        {formatDate(selectedProduct.end_time)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Product Description */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {t("products.description")}
                </h4>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {selectedProduct.description ||
                    "A beautiful, one-of-a-kind item perfect for your collection. This carefully curated piece offers exceptional quality and unique characteristics that make it a standout addition to any space."}
                </p>
              </div>

              {/* Product Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {t("products.category")}:
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {selectedProduct.category || t("products.uncategorized")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {t("products.location")}:
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {selectedProduct.location ||
                        t("products.locationNotSpecified")}
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {t("products.seller")}:
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {t("products.anonymousSeller")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Gavel className="w-4 h-4 text-purple-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {t("products.condition")}:
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {selectedProduct.condition ||
                        t("products.conditionNotSpecified")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm transition-all duration-200">
                  {error}
                </div>
              )}

              {/* Bidding Form */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {t("products.placeBid")}
                </h4>
                <form onSubmit={handlePlaceBid} className="space-y-4">
                  <div>
                    <label
                      htmlFor="bidAmount"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200"
                    >
                      {t("products.yourBidAmount")}
                    </label>
                    <div className="relative">
                      <Banknote className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        id="bidAmount"
                        type="number"
                        step="0.01"
                        min={selectedProduct.current_price + 0.01}
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                        placeholder={t("products.enterBid")}
                      />
                    </div>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200">
                      {t("products.minimumBid")}:{" "}
                      {formatPrice(selectedProduct.current_price + 0.01)}
                    </p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProduct(null);
                        setBidAmount("");
                        setError("");
                      }}
                      className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                    >
                      {t("cancel")}
                    </button>
                    <button
                      type="submit"
                      disabled={bidding}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                    >
                      {bidding
                        ? t("products.placingBid")
                        : t("products.placeBid")}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

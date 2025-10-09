import React, { useEffect, useState } from "react";
import { supabase, Product } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import { Gavel, Clock, TrendingUp, DollarSign } from "lucide-react";

export const ProductsPage: React.FC = () => {
  const { user } = useAuth();
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
        `Bid must be higher than current price of ${formatPrice(
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

      setSuccess("Bid placed successfully!");
      setBidAmount("");
      setSelectedProduct(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to place bid");
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
    if (!dateString) return "No end date";
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
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-200">
          Active Auctions
        </h1>
        <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200">
          Browse and bid on available products
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
            No Active Auctions
          </h3>
          <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200">
            Check back later for new products
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-900/20 overflow-hidden hover:shadow-xl transition-all duration-200"
            >
              <div className="h-56 bg-gradient-to-br from-green-100 to-emerald-200 dark:from-gray-700 dark:to-gray-900 flex items-center justify-center transition-colors duration-200">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Gavel className="w-20 h-20 text-green-400" />
                )}
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-200">
                  {product.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2 transition-colors duration-200">
                  {product.description || "No description available"}
                </p>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
                      Starting Price:
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white transition-colors duration-200">
                      {formatPrice(product.starting_price)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">
                        Current Bid:
                      </span>
                    </div>
                    <span className="text-lg font-bold text-green-600 dark:text-green-400 transition-colors duration-200">
                      {formatPrice(product.current_price)}
                    </span>
                  </div>

                  {product.end_time && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
                      <Clock className="w-4 h-4" />
                      <span>Ends: {formatDate(product.end_time)}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    setSelectedProduct(product);
                    setBidAmount((product.current_price + 1).toFixed(2));
                    setError("");
                    setSuccess("");
                  }}
                  className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <Gavel className="w-5 h-5" />
                  Place Bid
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 transition-colors duration-200">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-200">
              Place Your Bid
            </h3>

            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-200">
                {selectedProduct.name}
              </h4>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400 transition-colors duration-200">
                  Current Bid:
                </span>
                <span className="font-bold text-green-600 dark:text-green-400 transition-colors duration-200">
                  {formatPrice(selectedProduct.current_price)}
                </span>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm transition-all duration-200">
                {error}
              </div>
            )}

            <form onSubmit={handlePlaceBid} className="space-y-4">
              <div>
                <label
                  htmlFor="bidAmount"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200"
                >
                  Your Bid Amount
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="bidAmount"
                    type="number"
                    step="0.01"
                    min={selectedProduct.current_price + 0.01}
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    placeholder="Enter your bid"
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200">
                  Minimum bid:{" "}
                  {formatPrice(selectedProduct.current_price + 0.01)}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedProduct(null);
                    setBidAmount("");
                    setError("");
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bidding}
                  className="flex-1 bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {bidding ? "Placing Bid..." : "Confirm Bid"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

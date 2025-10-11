import React, { useEffect, useState } from "react";
import { supabase, Product, Bid } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import {
  TrendingUp,
  Gavel,
  Award,
  Clock,
  CreditCard,
  X,
  QrCode,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import QRCode from "qrcode";

type BidWithProduct = Bid & {
  products: Product;
};

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [availableBids, setAvailableBids] = useState<Product[]>([]);
  const [appliedBids, setAppliedBids] = useState<BidWithProduct[]>([]);
  const [wonBids, setWonBids] = useState<BidWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBid, setSelectedBid] = useState<BidWithProduct | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [userPhoneNumber, setUserPhoneNumber] = useState("");
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);

  useEffect(() => {
    if (user) {
      fetchDashboardData();

      const bidsSubscription = supabase
        .channel("bids_changes")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "bids" },
          () => {
            fetchDashboardData();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(bidsSubscription);
      };
    }
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);

    const { data: availableProducts } = await supabase
      .from("products")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false });

    const { data: myBids } = await supabase
      .from("bids")
      .select("*, products(*)")
      .eq("bidder_id", user?.id)
      .order("created_at", { ascending: false });

    const { data: wonBidsData } = await supabase
      .from("bids")
      .select("*, products(*)")
      .eq("bidder_id", user?.id)
      .eq("status", "won")
      .order("created_at", { ascending: false });

    setAvailableBids(availableProducts || []);
    setAppliedBids(myBids || []);
    setWonBids(wonBidsData || []);
    setLoading(false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("sv-SE", {
      style: "currency",
      currency: "SEK",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handlePayment = async (bid: BidWithProduct) => {
    setSelectedBid(bid);

    // Check if payment is already submitted
    if (bid.payment_status === "pending") {
      setPaymentSubmitted(true);
      setUserPhoneNumber(bid.payment_phone || ""); // Show previously submitted phone
    } else {
      setPaymentSubmitted(false);
      setUserPhoneNumber("");
    }

    // Static Swish data - will be updated later with actual merchant details
    const phoneNumber = "+46701234567"; // Static merchant phone number
    const amount = bid.amount;
    const message = `FYNDAK-${bid.id}`; // Simple reference
    const swishUrl = generateSwishQR(phoneNumber, amount, message);

    try {
      const qrCodeDataUrl = await QRCode.toDataURL(swishUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
      setQrCodeUrl(qrCodeDataUrl);
    } catch (error) {
      console.error("Error generating QR code:", error);
    }

    setShowPaymentModal(true);
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedBid(null);
    setQrCodeUrl("");
    setUserPhoneNumber("");
    setPaymentSubmitted(false);
  };

  const handleSubmitPayment = async (bidId: string, phoneNumber: string) => {
    if (!phoneNumber.trim()) {
      alert("Please enter your phone number");
      return;
    }

    try {
      setPaymentProcessing(true);

      // First, verify the bid exists
      const { error: findError } = await supabase
        .from("bids")
        .select("id")
        .eq("id", bidId)
        .single();

      if (findError) {
        console.error("Could not find bid:", findError);
        throw new Error("Bid not found");
      }

      // Prepare update data
      const updateData = {
        payment_status: "pending" as const,
        payment_phone: phoneNumber.trim(),
      };

      // Submit payment information for admin verification
      const { error } = await supabase
        .from("bids")
        .update(updateData)
        .eq("id", bidId);

      if (error) {
        console.error("Database update error:", error);
        throw error;
      }
      setPaymentSubmitted(true);

      // Add a small delay to ensure database consistency
      setTimeout(async () => {
        // Refresh dashboard data
        await fetchDashboardData();
      }, 500);

      // Don't show alert since we have UI feedback
    } catch (error) {
      console.error("Error submitting payment:", error);
      alert("Error submitting payment. Please try again.");
    } finally {
      setPaymentProcessing(false);
    }
  };

  // Generate Swish QR code data
  const generateSwishQR = (
    phoneNumber: string,
    amount: number,
    message: string
  ) => {
    // Swish QR code format: swish://payment?phone=XXXXXXXXXX&amount=XXX&message=XXX
    const swishUrl = `swish://payment?phone=${phoneNumber}&amount=${amount}&message=${encodeURIComponent(
      message
    )}`;
    return swishUrl;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">
                Available Auctions
              </p>
              <p className="text-3xl font-bold mt-2">{availableBids.length}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-green-200 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">
                My Active Bids
              </p>
              <p className="text-3xl font-bold mt-2">{appliedBids.length}</p>
            </div>
            <Gavel className="w-12 h-12 text-blue-200 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl p-6 text-white transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">
                Won Auctions
              </p>
              <p className="text-3xl font-bold mt-2">{wonBids.length}</p>
            </div>
            <Award className="w-12 h-12 text-yellow-200 opacity-80" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-900/20 p-6 transition-colors duration-200">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-6 h-6 text-green-500" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-200">
            Active Auctions
          </h2>
        </div>

        {availableBids.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8 transition-colors duration-200">
            No active auctions available
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableBids.slice(0, 6).map((product) => (
              <div
                key={product.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200"
              >
                <div className="h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center transition-colors duration-200">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Gavel className="w-16 h-16 text-gray-400" />
                  )}
                </div>
                <div className="p-4 bg-white dark:bg-gray-900 transition-colors duration-200">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-200">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400 transition-colors duration-200">
                      Current Bid:
                    </span>
                    <span className="font-bold text-green-600 transition-colors duration-200">
                      {formatPrice(product.current_price)}
                    </span>
                  </div>
                  {product.end_time && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200">
                      <Clock className="w-4 h-4" />
                      <span>Ends: {formatDate(product.end_time)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <Gavel className="w-6 h-6 text-blue-500" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Bids
          </h2>
        </div>

        {appliedBids.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            You haven't placed any bids yet
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 transition-colors duration-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-200">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-200">
                    My Bid
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-200">
                    Current Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-200">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider transition-colors duration-200">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-200">
                {appliedBids.map((bid) => (
                  <tr
                    key={bid.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white transition-colors duration-200">
                        {bid.products.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white font-semibold transition-colors duration-200">
                        {formatPrice(bid.amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white transition-colors duration-200">
                        {formatPrice(bid.products.current_price)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full transition-colors duration-200 ${
                          bid.status === "active"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : bid.status === "won"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                      >
                        {bid.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
                      {formatDate(bid.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {wonBids.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <Award className="w-6 h-6 text-yellow-500" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Won Auctions
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wonBids.map((bid) => (
              <div
                key={bid.id}
                className="border-2 border-yellow-400 rounded-lg overflow-hidden"
              >
                <div className="h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  {bid.products.image_url ? (
                    <img
                      src={bid.products.image_url}
                      alt={bid.products.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Award className="w-16 h-16 text-gray-400" />
                  )}
                </div>
                <div className="p-4 bg-yellow-50 dark:bg-gray-900">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {bid.products.name}
                  </h3>
                  <div className="flex items-center justify-between text-sm mb-4">
                    <span className="text-gray-600 dark:text-gray-400">
                      Winning Bid:
                    </span>
                    <span className="font-bold text-yellow-600">
                      {formatPrice(bid.amount)}
                    </span>
                  </div>

                  {/* Payment Status */}
                  {bid.payment_status === "paid" ? (
                    <div className="w-full space-y-2">
                      <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors duration-200">
                        <CheckCircle className="w-5 h-5" />
                        Payment Completed
                      </div>
                      {bid.payment_date && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 text-center transition-colors duration-200">
                          Paid on {formatDate(bid.payment_date)}
                        </p>
                      )}
                    </div>
                  ) : bid.payment_status === "cancelled" ? (
                    <div className="w-full bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors duration-200">
                      <AlertCircle className="w-5 h-5" />
                      Payment Cancelled
                    </div>
                  ) : bid.payment_status === "pending" && bid.payment_phone ? (
                    <div className="w-full space-y-2">
                      <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors duration-200">
                        <Clock className="w-5 h-5" />
                        Payment Verification Pending
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 text-center transition-colors duration-200">
                        Admin is verifying your payment
                      </p>
                      <button
                        onClick={() => handlePayment(bid)}
                        className="w-full bg-gray-500 text-white py-1 text-sm rounded-lg font-medium hover:bg-gray-600 transition-colors duration-200 flex items-center justify-center gap-2"
                      >
                        <CreditCard className="w-4 h-4" />
                        View Payment Details
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handlePayment(bid)}
                      className="w-full bg-yellow-500 text-white py-2 rounded-lg font-semibold hover:bg-yellow-600 transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      <CreditCard className="w-5 h-5" />
                      Pay Here
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedBid && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto transition-colors duration-200">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <QrCode className="w-6 h-6 text-blue-500" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-200">
                    Swish Payment
                  </h2>
                </div>
                <button
                  onClick={closePaymentModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Product Info */}
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-200">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-200">
                  {selectedBid.products.name}
                </h3>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400 transition-colors duration-200">
                    Amount to pay:
                  </span>
                  <span className="text-2xl font-bold text-green-600 dark:text-green-400 transition-colors duration-200">
                    {formatPrice(selectedBid.amount)}
                  </span>
                </div>
              </div>

              {/* QR Code */}
              <div className="mb-6">
                <div className="text-center mb-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-200">
                    Scan with Swish App
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
                    Open your Swish app and scan the QR code below
                  </p>
                </div>

                {qrCodeUrl ? (
                  <div className="flex justify-center">
                    <div className="p-4 bg-white rounded-lg shadow-inner">
                      <img
                        src={qrCodeUrl}
                        alt="Swish QR Code"
                        className="w-64 h-64 mx-auto"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center items-center h-64 bg-gray-100 dark:bg-gray-700 rounded-lg transition-colors duration-200">
                    <div className="text-center">
                      <QrCode className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 dark:text-gray-400 transition-colors duration-200">
                        Generating QR code...
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Info */}
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 transition-colors duration-200">
                <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2 transition-colors duration-200">
                  Payment Details (Static - Will be updated)
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700 dark:text-blue-400 transition-colors duration-200">
                      Recipient:
                    </span>
                    <span className="font-medium text-blue-900 dark:text-blue-300 transition-colors duration-200">
                      FYNDAK Auctions
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700 dark:text-blue-400 transition-colors duration-200">
                      Swish Number:
                    </span>
                    <span className="font-medium text-blue-900 dark:text-blue-300 transition-colors duration-200">
                      +46 764 459 662
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700 dark:text-blue-400 transition-colors duration-200">
                      Reference:
                    </span>
                    <span className="font-medium text-blue-900 dark:text-blue-300 transition-colors duration-200">
                      FYNDAK-{selectedBid.id.slice(0, 8)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700 dark:text-blue-400 transition-colors duration-200">
                      Amount:
                    </span>
                    <span className="font-medium text-blue-900 dark:text-blue-300 transition-colors duration-200">
                      {formatPrice(selectedBid.amount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 transition-colors duration-200">
                  Payment Process:
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
                  <li>Open the Swish app on your phone</li>
                  <li>
                    Scan the QR code above or send manually to +46 764 459 662
                  </li>
                  <li>Use reference: FYNDAK-{selectedBid.id.slice(0, 8)}</li>
                  <li>Complete the payment in your Swish app</li>
                  <li>Enter your phone number below for verification</li>
                  <li>
                    Submit the form - Admin will verify and confirm payment
                  </li>
                </ol>
              </div>

              {/* Payment Form */}
              {!paymentSubmitted ? (
                <div className="space-y-4">
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg transition-colors duration-200">
                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2 transition-colors duration-200">
                      After Payment Confirmation
                    </h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-400 transition-colors duration-200">
                      Once you've completed the Swish payment, please provide
                      your phone number below so our admin can verify the
                      payment.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                      Your Phone Number (used for Swish payment)
                    </label>
                    <input
                      type="tel"
                      value={userPhoneNumber}
                      onChange={(e) => setUserPhoneNumber(e.target.value)}
                      placeholder="+46 XX XXX XX XX"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                      disabled={paymentProcessing}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-200">
                      This helps our admin verify your payment in the Swish
                      system
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() =>
                        selectedBid &&
                        handleSubmitPayment(selectedBid.id, userPhoneNumber)
                      }
                      disabled={paymentProcessing || !userPhoneNumber.trim()}
                      className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      {paymentProcessing
                        ? "Submitting..."
                        : "Submit Payment Info"}
                    </button>

                    <button
                      onClick={closePaymentModal}
                      disabled={paymentProcessing}
                      className="px-6 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white py-3 rounded-lg font-semibold transition-colors duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* Payment Submitted State */
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg transition-colors duration-200">
                    <div className="flex items-center gap-3 mb-3">
                      <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      <h4 className="font-semibold text-blue-800 dark:text-blue-300 transition-colors duration-200">
                        Payment Verification Pending
                      </h4>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p className="text-blue-700 dark:text-blue-400 transition-colors duration-200">
                        Your payment information has been submitted and is
                        awaiting admin verification.
                      </p>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded border border-blue-200 dark:border-blue-700">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">
                              Amount:
                            </span>
                            <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                              {formatPrice(selectedBid.amount)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">
                              Reference:
                            </span>
                            <span className="ml-2 font-mono text-gray-900 dark:text-white">
                              FYNDAK-{selectedBid.id.slice(0, 8)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">
                              Swish Number:
                            </span>
                            <span className="ml-2 font-mono text-gray-900 dark:text-white">
                              +46 764 459 662
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">
                              Your Phone:
                            </span>
                            <span className="ml-2 font-mono text-gray-900 dark:text-white">
                              {userPhoneNumber || "Not provided"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-blue-600 dark:text-blue-500 transition-colors duration-200">
                        <strong>Status:</strong> Pending Admin Verification
                      </p>
                    </div>
                  </div>

                  {/* Update Phone Number Option */}
                  {selectedBid.payment_status === "pending" && (
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <p className="text-sm text-yellow-700 dark:text-yellow-400 mb-2">
                        Need to update your phone number?
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="tel"
                          value={userPhoneNumber}
                          onChange={(e) => setUserPhoneNumber(e.target.value)}
                          placeholder="+46 XX XXX XX XX"
                          className="flex-1 px-2 py-1 text-sm border border-yellow-300 dark:border-yellow-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        <button
                          onClick={() =>
                            selectedBid &&
                            handleSubmitPayment(selectedBid.id, userPhoneNumber)
                          }
                          disabled={
                            paymentProcessing || !userPhoneNumber.trim()
                          }
                          className="px-3 py-1 text-sm bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300 text-white rounded font-medium transition-colors duration-200"
                        >
                          {paymentProcessing ? "Updating..." : "Update"}
                        </button>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={closePaymentModal}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold transition-colors duration-200"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

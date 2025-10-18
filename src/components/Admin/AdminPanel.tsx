import React, { useEffect, useState } from "react";
import { supabase, Product, Profile, Bid } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import { useAppTranslation } from "../../hooks/useLanguage";
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  Package,
  Users,
  Upload,
} from "lucide-react";

interface BidWithProfile extends Bid {
  profile: (Profile & { email: string }) | null;
}

export const AdminPanel: React.FC = () => {
  const { profile } = useAuth();
  const { t } = useAppTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showBidders, setShowBidders] = useState(false);
  const [bidders, setBidders] = useState<BidWithProfile[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image_url: "",
    starting_price: "",
    end_time: "",
    category: "",
    location: "",
    condition: "",
  });

  const [locationDetecting, setLocationDetecting] = useState(false);
  const [locationError, setLocationError] = useState("");

  useEffect(() => {
    if (profile?.is_admin) {
      fetchProducts();
    }
  }, [profile]);

  const fetchProducts = async () => {
    console.log("Fetching products...");
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching products:", error);
    } else {
      console.log("Products fetched:", data);
      setProducts(data || []);
    }
    setLoading(false);
  };

  const fetchBidders = async (productId: string) => {
    console.log(`Fetching bidders for product ${productId}...`);
    const { data, error } = await supabase
      .from("bids")
      .select("*, profile:profiles_with_email(*)")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching bidders:", error);
    } else {
      console.log("Bidders fetched:", data);
      setBidders((data as never) || []);
    }
  };

  const updateBidStatus = async (
    bidId: string,
    newStatus: string,
    newPaymentStatus?: string
  ) => {
    try {
      setError("");
      setSuccess("");

      const updateData: {
        status: string;
        payment_status?: string;
        payment_date?: string;
      } = { status: newStatus };
      if (newPaymentStatus) {
        updateData.payment_status = newPaymentStatus;
        if (newPaymentStatus === "paid") {
          updateData.payment_date = new Date().toISOString();
        }
      }

      const { error } = await supabase
        .from("bids")
        .update(updateData)
        .eq("id", bidId);

      if (error) throw error;

      // Refresh bidders list
      if (selectedProduct) {
        await fetchBidders(selectedProduct.id);
      }

      setSuccess(t("admin.bidStatusUpdated"));

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : t("admin.failedToUpdateBidStatus")
      );
      setTimeout(() => setError(""), 5000);
    }
  };

  const handleOpenModal = (product?: Product) => {
    if (product) {
      // Convert UTC datetime from database to local datetime for form input
      const convertToLocalDatetime = (utcDatetime: string | undefined) => {
        if (!utcDatetime) return "";
        const date = new Date(utcDatetime);
        // Get local datetime in YYYY-MM-DDTHH:MM format
        const localDatetime = new Date(
          date.getTime() - date.getTimezoneOffset() * 60000
        )
          .toISOString()
          .slice(0, 16);
        return localDatetime;
      };

      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || "",
        image_url: product.image_url || "",
        starting_price: product.starting_price.toString(),
        end_time: convertToLocalDatetime(product.end_time),
        category: product.category || "",
        location: product.location || "",
        condition: product.condition || "",
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        description: "",
        image_url: "",
        starting_price: "",
        end_time: "",
        category: "",
        location: "",
        condition: "",
      });
      // Clear image state for new product
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setSelectedFile(null);
      setPreviewUrl("");
      setUploadProgress(0);
    }
    setShowModal(true);
    setError("");
    setSuccess("");
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setError("");
    setSuccess("");
    // Clear image state
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl("");
    setUploadProgress(0);
  };

  const handleShowBidders = (product: Product) => {
    setSelectedProduct(product);
    fetchBidders(product.id);
    setShowBidders(true);
  };

  const handleCloseBidders = () => {
    setShowBidders(false);
    setSelectedProduct(null);
    setBidders([]);
    setError("");
    setSuccess("");
  };

  // Image compression function
  const compressImage = (
    file: File,
    maxWidth = 800,
    maxHeight = 600,
    quality = 0.8
  ): Promise<Blob> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
          },
          "image/jpeg",
          quality
        );
      };

      img.src = URL.createObjectURL(file);
    });
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Clean up previous preview URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      // Clear URL input when file is selected
      setFormData({ ...formData, image_url: "" });
    }
  };

  // Upload image to Supabase storage
  const uploadImage = async (file: File): Promise<string> => {
    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Compress the image
      const compressedBlob = await compressImage(file);

      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `product-${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      // Upload to Supabase storage
      const { error } = await supabase.storage
        .from("product-images")
        .upload(filePath, compressedBlob, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("product-images").getPublicUrl(filePath);

      setUploadProgress(100);
      return publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      // Upload image if a file is selected
      let imageUrl = formData.image_url;
      if (selectedFile) {
        try {
          imageUrl = await uploadImage(selectedFile);
        } catch (error) {
          console.error("Image upload error:", error);
          setError(t("admin.failedToUploadImage"));
          return;
        }
      }

      // Convert local datetime to proper ISO string for database storage
      const convertToISOString = (localDatetime: string) => {
        if (!localDatetime) return null;
        // Create a Date object from the local datetime string
        // This treats the input as local time
        const localDate = new Date(localDatetime);
        // Return ISO string which includes timezone information
        return localDate.toISOString();
      };

      const productData = {
        name: formData.name,
        description: formData.description,
        image_url: imageUrl,
        starting_price: parseFloat(formData.starting_price),
        current_price: editingProduct
          ? editingProduct.current_price
          : parseFloat(formData.starting_price),
        end_time: convertToISOString(formData.end_time),
        status: "active" as const,
        category: formData.category,
        location: formData.location,
        condition: formData.condition,
      };

      if (editingProduct) {
        const { error: updateError } = await supabase
          .from("products")
          .update(productData)
          .eq("id", editingProduct.id);

        if (updateError) throw updateError;
        setSuccess(t("admin.productUpdated"));
      } else {
        const { error: insertError } = await supabase
          .from("products")
          .insert([productData]);

        if (insertError) throw insertError;
        setSuccess(t("admin.productCreated"));
      }

      fetchProducts();
      handleCloseModal();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : t("admin.failedToSaveProduct")
      );
    }
  };

  const handleEndAuction = async (productId: string) => {
    console.log(`Ending auction for product ${productId}...`);
    try {
      // 1. Update product status to 'ended'
      console.log("Updating product status to 'ended'...");
      const { error: productError } = await supabase
        .from("products")
        .update({ status: "ended" })
        .eq("id", productId);

      if (productError) {
        console.error("Error updating product status:", productError);
        throw productError;
      }
      console.log("Product status updated successfully.");

      // 2. Find the winning bid
      console.log("Finding winning bid...");
      const { data: winningBid, error: winningBidError } = await supabase
        .from("bids")
        .select("*")
        .eq("product_id", productId)
        .order("amount", { ascending: false })
        .limit(1)
        .maybeSingle(); // Use maybeSingle() instead of single() to avoid error when no bids

      // Check for actual error (not just no results)
      if (winningBidError) {
        console.error("Error finding winning bid:", winningBidError);
        throw winningBidError;
      }

      if (winningBid) {
        console.log("Winning bid found:", winningBid);

        // 3. Update winning bid status to 'won'
        console.log("Updating winning bid status to 'won'...");
        const { error: wonError, data: wonData } = await supabase
          .from("bids")
          .update({ status: "won" })
          .eq("id", winningBid.id)
          .select(); // Add select() to see what was updated

        console.log("Won update result:", wonData);
        if (wonError) {
          console.error("Error updating winning bid status:", wonError);
          throw wonError;
        }
        console.log("Winning bid status updated successfully.");

        // 4. Update other active bids to 'ended'
        console.log("Updating other active bids to 'ended'...");
        const { error: endedError, data: endedData } = await supabase
          .from("bids")
          .update({ status: "ended" })
          .eq("product_id", productId)
          .neq("id", winningBid.id)
          .eq("status", "active")
          .select(); // Add select() to see what was updated

        console.log("Ended bids result:", endedData);
        if (endedError) {
          console.error("Error updating other bids to 'ended':", endedError);
          throw endedError;
        }
        console.log(
          `${endedData?.length || 0} other active bids updated successfully.`
        );
      } else {
        console.log(
          "No winning bid found. Updating all active bids to 'ended'."
        );

        // If there's no winning bid, update all active bids to 'ended'
        const { error: endedError, data: endedData } = await supabase
          .from("bids")
          .update({ status: "ended" })
          .eq("product_id", productId)
          .eq("status", "active")
          .select(); // Add select() to see what was updated

        console.log("All ended bids result:", endedData);
        if (endedError) {
          console.error(
            "Error updating all active bids to 'ended':",
            endedError
          );
          throw endedError;
        }
        console.log(
          `${
            endedData?.length || 0
          } active bids updated to 'ended' successfully.`
        );
      }

      setSuccess(t("admin.auctionEnded"));
      fetchProducts();
    } catch (err: unknown) {
      console.error("Error ending auction:", err);
      setError(err instanceof Error ? err.message : "Failed to end auction");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const { error } = await supabase.from("products").delete().eq("id", id);

      if (error) throw error;

      setSuccess("Product deleted successfully!");
      await fetchProducts();
    } catch (err: unknown) {
      setError("Failed to delete product");
      console.error("Error:", err);
    }
  };

  const detectLocation = async () => {
    setLocationDetecting(true);
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError(t("admin.geolocationNotSupported"));
      setLocationDetecting(false);
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000, // 5 minutes
          });
        }
      );

      const { latitude, longitude } = position.coords;

      // Use OpenStreetMap Nominatim for reverse geocoding (free service)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=en`
      );

      if (!response.ok) {
        throw new Error("Geocoding request failed");
      }

      const data = await response.json();

      // Extract city name from the response
      const city =
        data.address?.city ||
        data.address?.town ||
        data.address?.village ||
        data.address?.municipality ||
        data.address?.county;

      const country = data.address?.country;

      if (city && country) {
        // Check if the detected city matches one of our predefined locations
        const detectedLocation = `${city}, ${country}`;
        const predefinedLocations = [
          "Stockholm, Sweden",
          "Göteborg, Sweden",
          "Malmö, Sweden",
          "Uppsala, Sweden",
          "Linköping, Sweden",
          "Örebro, Sweden",
          "Helsingborg, Sweden",
          "Jönköping, Sweden",
          "Karlskrona, Sweden",
        ];

        // Create a mapping for common city name variations to use preferred formatting
        const cityMapping: { [key: string]: string } = {
          stockholm: "Stockholm, Sweden",
          göteborg: "Göteborg, Sweden",
          gothenburg: "Göteborg, Sweden",
          malmö: "Malmö, Sweden",
          malmo: "Malmö, Sweden",
          uppsala: "Uppsala, Sweden",
          linköping: "Linköping, Sweden",
          linkoping: "Linköping, Sweden",
          örebro: "Örebro, Sweden",
          orebro: "Örebro, Sweden",
          helsingborg: "Helsingborg, Sweden",
          jönköping: "Jönköping, Sweden",
          jonkoping: "Jönköping, Sweden",
          karlskrona: "Karlskrona, Sweden",
        };

        // Try to find preferred formatting first, otherwise use detected location as-is
        const cityLower = city.toLowerCase();
        const finalLocation =
          cityMapping[cityLower] ||
          predefinedLocations.find((loc) =>
            loc.toLowerCase().includes(cityLower)
          ) ||
          detectedLocation; // Always use detected location if no match found

        setFormData((prevFormData) => ({
          ...prevFormData,
          location: finalLocation,
        }));
        setLocationError("");
      } else {
        setLocationError(t("admin.couldNotDetectCity"));
      }
    } catch (error) {
      console.error("Location detection error:", error);
      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError(t("admin.locationPermissionDenied"));
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError(t("admin.locationUnavailable"));
            break;
          case error.TIMEOUT:
            setLocationError(t("admin.locationTimeout"));
            break;
          default:
            setLocationError(t("admin.locationError"));
            break;
        }
      } else {
        setLocationError(t("admin.locationError"));
      }
    } finally {
      setLocationDetecting(false);
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
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });
  };

  if (!profile?.is_admin) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-900/20 p-12 text-center transition-colors duration-200">
        <Package className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4 transition-colors duration-200" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-200">
          Access Denied
        </h3>
        <p className="text-gray-600 dark:text-gray-300 transition-colors duration-200">
          You don't have permission to access this page
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-200">
            {t("admin.title")}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 transition-colors duration-200">
            {t("admin.manageProducts")}
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors duration-200"
        >
          <Plus className="w-5 h-5" />
          {t("admin.addProduct")}
        </button>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300 transition-all duration-200">
          {success}
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 transition-all duration-200">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-900/20 overflow-hidden transition-colors duration-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 transition-colors duration-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors duration-200">
                  {t("admin.productName")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors duration-200">
                  {t("admin.startingPrice")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors duration-200">
                  {t("admin.currentPrice")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors duration-200">
                  {t("admin.status")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors duration-200">
                  {t("admin.endTime")}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors duration-200">
                  {t("admin.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-200">
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center transition-colors duration-200">
                          <Package className="w-6 h-6 text-gray-400 dark:text-gray-500 transition-colors duration-200" />
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white transition-colors duration-200">
                          {product.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 transition-colors duration-200">
                          {product.description || "No description"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white transition-colors duration-200">
                      {formatPrice(product.starting_price)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-green-600 dark:text-green-400 transition-colors duration-200">
                      {formatPrice(product.current_price)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full transition-all duration-200 ${
                        product.status === "active"
                          ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100"
                          : product.status === "ended"
                          ? "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100"
                          : "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100"
                      }`}
                    >
                      {product.status === "active"
                        ? t("admin.statusActive")
                        : product.status === "ended"
                        ? t("admin.statusEnded")
                        : product.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
                    {formatDate(product.end_time)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleShowBidders(product)}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
                        title={t("admin.viewBidders")}
                      >
                        <Users className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenModal(product)}
                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                        title={t("admin.editProduct")}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {product.status === "active" && (
                        <button
                          onClick={() => handleEndAuction(product.id)}
                          className="p-2 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-all duration-200"
                          title={t("admin.endAuction")}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                        title={t("admin.deleteProduct")}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto transition-colors duration-200">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 transition-colors duration-200">
              {editingProduct
                ? t("admin.editProduct")
                : t("admin.addNewProduct")}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200"
                >
                  {t("admin.productName")}
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  placeholder={t("admin.productNamePlaceholder")}
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200"
                >
                  {t("admin.description")}
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder={t("admin.descriptionPlaceholder")}
                />
              </div>

              {/* New fields: Category, Location, Condition */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="category"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200"
                  >
                    {t("admin.category")}
                  </label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">{t("admin.selectCategory")}</option>
                    <option value="Home & Garden">
                      {t("admin.categoryHomeGarden")}
                    </option>
                    <option value="Collectibles">
                      {t("admin.categoryCollectibles")}
                    </option>
                    <option value="Fashion">
                      {t("admin.categoryFashion")}
                    </option>
                    <option value="Crafts">{t("admin.categoryCrafts")}</option>
                    <option value="Electronics">
                      {t("admin.categoryElectronics")}
                    </option>
                    <option value="Art">{t("admin.categoryArt")}</option>
                    <option value="Jewelry">
                      {t("admin.categoryJewelry")}
                    </option>
                    <option value="Books">{t("admin.categoryBooks")}</option>
                    <option value="Sports">{t("admin.categorySports")}</option>
                    <option value="Other">{t("admin.categoryOther")}</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="location"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200"
                  >
                    {t("admin.location")}
                  </label>
                  <div className="relative">
                    <select
                      id="location"
                      value={formData.location}
                      onChange={(e) => {
                        if (e.target.value === "detect-location") {
                          // Reset to empty so the dropdown doesn't stay on "detect-location"
                          setFormData({ ...formData, location: "" });
                          detectLocation();
                        } else if (e.target.value === "custom-location") {
                          // Switch to text input mode
                          setFormData({ ...formData, location: "" });
                        } else {
                          setFormData({
                            ...formData,
                            location: e.target.value,
                          });
                        }
                      }}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      disabled={locationDetecting}
                    >
                      <option value="">{t("admin.selectLocation")}</option>
                      <option
                        value="detect-location"
                        style={{ color: "#10B981", fontWeight: "500" }}
                      >
                        📍{" "}
                        {locationDetecting
                          ? t("admin.detectingLocation")
                          : t("admin.detectLocation")}
                      </option>
                      <option disabled style={{ color: "#9CA3AF" }}>
                        ──────────────
                      </option>
                      <option value="Stockholm, Sweden">
                        {t("admin.locationStockholm")}
                      </option>
                      <option value="Göteborg, Sweden">
                        {t("admin.locationGoteborg")}
                      </option>
                      <option value="Malmö, Sweden">
                        {t("admin.locationMalmo")}
                      </option>
                      <option value="Uppsala, Sweden">
                        {t("admin.locationUppsala")}
                      </option>
                      <option value="Linköping, Sweden">
                        {t("admin.locationLinkoping")}
                      </option>
                      <option value="Örebro, Sweden">
                        {t("admin.locationOrebro")}
                      </option>
                      <option value="Helsingborg, Sweden">
                        {t("admin.locationHelsingborg")}
                      </option>
                      <option value="Jönköping, Sweden">
                        {t("admin.locationJonkoping")}
                      </option>
                      <option value="Karlskrona, Sweden">
                        {t("admin.locationKarlskrona")}
                      </option>
                      <option disabled style={{ color: "#9CA3AF" }}>
                        ──────────────
                      </option>
                      <option
                        value="custom-location"
                        style={{ color: "#6366F1", fontWeight: "500" }}
                      >
                        ✏️ {t("admin.enterCustomLocation")}
                      </option>
                    </select>

                    {/* Show text input if location is not in predefined list or custom option selected */}
                    {formData.location &&
                      ![
                        "Stockholm, Sweden",
                        "Göteborg, Sweden",
                        "Malmö, Sweden",
                        "Uppsala, Sweden",
                        "Linköping, Sweden",
                        "Örebro, Sweden",
                        "Helsingborg, Sweden",
                        "Jönköping, Sweden",
                        "Karlskrona, Sweden",
                      ].includes(formData.location) && (
                        <input
                          type="text"
                          value={formData.location}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              location: e.target.value,
                            })
                          }
                          placeholder={t("admin.enterLocation")}
                          className="mt-2 w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                        />
                      )}
                  </div>
                  {locationError && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                      {locationError}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="condition"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200"
                  >
                    {t("admin.condition")}
                  </label>
                  <select
                    id="condition"
                    value={formData.condition}
                    onChange={(e) =>
                      setFormData({ ...formData, condition: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">{t("admin.selectCondition")}</option>
                    <option value="New">{t("admin.conditionNew")}</option>
                    <option value="Like New">
                      {t("admin.conditionLikeNew")}
                    </option>
                    <option value="Excellent">
                      {t("admin.conditionExcellent")}
                    </option>
                    <option value="Very Good">
                      {t("admin.conditionVeryGood")}
                    </option>
                    <option value="Good">{t("admin.conditionGood")}</option>
                    <option value="Fair">{t("admin.conditionFair")}</option>
                    <option value="Poor">{t("admin.conditionPoor")}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                  {t("admin.productImage")}
                </label>

                {/* File Upload Button */}
                <div className="mb-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg cursor-pointer transition-colors duration-200"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {t("admin.chooseImage")}
                  </label>
                </div>

                {/* URL Input Alternative */}
                <div className="mb-4">
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) =>
                      setFormData({ ...formData, image_url: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                    placeholder={t("admin.imageUrlPlaceholder")}
                  />
                </div>

                {/* Image Preview */}
                {(selectedFile || formData.image_url) && (
                  <div className="mb-4">
                    <img
                      src={
                        selectedFile
                          ? URL.createObjectURL(selectedFile)
                          : formData.image_url
                      }
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                    />
                    {selectedFile && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        File: {selectedFile.name} (
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    )}
                  </div>
                )}

                {/* Upload Progress */}
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="mb-4">
                    <div className="flex items-center mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {t("admin.uploadProgress")} {uploadProgress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="starting_price"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200"
                  >
                    {t("admin.startingPrice")} (SEK)
                  </label>
                  <input
                    id="starting_price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.starting_price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        starting_price: e.target.value,
                      })
                    }
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label
                    htmlFor="end_time"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200"
                  >
                    {t("admin.endTime")}
                  </label>
                  <input
                    id="end_time"
                    type="datetime-local"
                    value={formData.end_time}
                    onChange={(e) =>
                      setFormData({ ...formData, end_time: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                >
                  {t("admin.cancel")}
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition"
                >
                  {editingProduct
                    ? t("admin.updateProduct")
                    : t("admin.createProduct")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showBidders && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto transition-colors duration-200">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-200">
              {t("admin.biddersFor")} {selectedProduct.name}
            </h3>

            {/* Auction Status Indicator */}
            <div className="mb-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-700 transition-colors duration-200">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                <span className="font-semibold">
                  {t("admin.auctionStatus")}:
                </span>{" "}
                <span
                  className={`font-bold uppercase ${
                    selectedProduct.status === "ended"
                      ? "text-red-600 dark:text-red-400"
                      : "text-green-600 dark:text-green-400"
                  }`}
                >
                  {selectedProduct.status === "ended"
                    ? t("admin.statusEnded")
                    : t("admin.statusActive")}
                </span>
              </p>

              {/* Payment Verification Instructions */}
              {selectedProduct.status === "ended" && (
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-xs">
                  <p className="font-semibold text-blue-800 dark:text-blue-300 mb-1">
                    💡 {t("admin.paymentVerificationGuide")}:
                  </p>
                  <ul className="text-blue-700 dark:text-blue-400 space-y-1">
                    <li>• {t("admin.paymentVerificationStep1")}</li>
                    <li>• {t("admin.paymentVerificationStep2")}</li>
                    <li>• {t("admin.paymentVerificationStep3")}</li>
                    <li>• {t("admin.paymentVerificationStep4")}</li>
                  </ul>
                </div>
              )}

              {selectedProduct.status === "active" && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t("admin.activeAuctionNote")}
                </p>
              )}
            </div>

            {/* Success/Error Messages */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-sm text-green-600 dark:text-green-400">
                  {success}
                </p>
              </div>
            )}

            {bidders.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-300 transition-colors duration-200">
                {t("admin.noBidders")}
              </p>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {bidders
                  .sort((a, b) => b.amount - a.amount) // Sort by amount descending (highest first)
                  .map((bid, index) => {
                    const isWinner = bid.status === "won";
                    const isHighestBid = index === 0;
                    const isWinnerCandidate =
                      isHighestBid && selectedProduct?.status === "active";

                    return (
                      <li
                        key={bid.id}
                        className={`py-4 flex items-center justify-between rounded-lg px-3 transition-all duration-200 ${
                          isWinner
                            ? "bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-300 dark:border-yellow-600"
                            : isWinnerCandidate
                            ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700"
                            : "hover:bg-gray-50 dark:hover:bg-gray-700"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div>
                            {isWinner && (
                              <div className="flex items-center gap-1 mb-1">
                                <CheckCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                                <span className="text-xs font-bold text-yellow-700 dark:text-yellow-400 uppercase tracking-wide">
                                  {t("admin.winner")}
                                </span>
                              </div>
                            )}
                            {isWinnerCandidate && !isWinner && (
                              <div className="flex items-center gap-1 mb-1">
                                <Package className="w-4 h-4 text-green-600 dark:text-green-400" />
                                <span className="text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-wide">
                                  {t("admin.leadingBid")}
                                </span>
                              </div>
                            )}
                            <p
                              className={`text-sm font-medium transition-colors duration-200 ${
                                isWinner
                                  ? "text-yellow-900 dark:text-yellow-100"
                                  : "text-gray-900 dark:text-white"
                              }`}
                            >
                              {bid.profile?.full_name}
                            </p>
                            <p
                              className={`text-sm transition-colors duration-200 ${
                                isWinner
                                  ? "text-yellow-700 dark:text-yellow-300"
                                  : "text-gray-500 dark:text-gray-400"
                              }`}
                            >
                              {bid.profile?.email}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end gap-2">
                          <div>
                            <p
                              className={`text-sm font-semibold transition-colors duration-200 ${
                                isWinner
                                  ? "text-yellow-700 dark:text-yellow-300"
                                  : isWinnerCandidate
                                  ? "text-green-600 dark:text-green-400"
                                  : "text-gray-600 dark:text-gray-400"
                              }`}
                            >
                              {formatPrice(bid.amount)}
                            </p>
                            <p
                              className={`text-xs transition-colors duration-200 ${
                                isWinner
                                  ? "text-yellow-600 dark:text-yellow-400"
                                  : "text-gray-500 dark:text-gray-400"
                              }`}
                            >
                              {formatDate(bid.created_at)}
                            </p>
                          </div>

                          {/* Status Controls - Show only for ended auctions */}
                          {selectedProduct?.status === "ended" ? (
                            <div className="flex flex-col gap-1 min-w-[120px]">
                              <select
                                value={bid.status}
                                onChange={(e) =>
                                  updateBidStatus(bid.id, e.target.value)
                                }
                                className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                              >
                                <option value="active">
                                  {t("admin.statusActive")}
                                </option>
                                <option value="outbid">
                                  {t("admin.statusOutbid")}
                                </option>
                                <option value="won">
                                  {t("admin.statusWon")}
                                </option>
                              </select>

                              {bid.status === "won" && (
                                <div className="space-y-2">
                                  {/* Payment Verification Alert */}
                                  {bid.payment_phone &&
                                    bid.payment_status === "pending" && (
                                      <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded text-xs">
                                        <div className="flex items-center gap-1 mb-1">
                                          <span className="text-yellow-600 dark:text-yellow-400 font-semibold">
                                            ⚠️{" "}
                                            {t(
                                              "admin.paymentVerificationNeeded"
                                            )}
                                          </span>
                                        </div>
                                        <p className="text-yellow-700 dark:text-yellow-300 mb-1">
                                          {t("admin.userSentPaymentFrom")}:
                                        </p>
                                        <p className="font-mono font-bold text-yellow-800 dark:text-yellow-200 bg-yellow-100 dark:bg-yellow-800/30 px-2 py-1 rounded">
                                          📱 {bid.payment_phone}
                                        </p>
                                        <p className="text-yellow-600 dark:text-yellow-400 mt-1">
                                          {t("admin.verifyInSwish")}
                                        </p>
                                      </div>
                                    )}

                                  <select
                                    value={bid.payment_status || "pending"}
                                    onChange={(e) =>
                                      updateBidStatus(
                                        bid.id,
                                        bid.status,
                                        e.target.value
                                      )
                                    }
                                    className={`text-xs px-2 py-1 border rounded transition-colors duration-200 ${
                                      bid.payment_status === "pending" &&
                                      bid.payment_phone
                                        ? "border-yellow-400 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200"
                                        : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    }`}
                                  >
                                    <option value="pending">
                                      {t("admin.paymentPending")}
                                    </option>
                                    <option value="paid">
                                      {t("admin.paymentPaid")}
                                    </option>
                                    <option value="cancelled">
                                      {t("admin.paymentCancelled")}
                                    </option>
                                  </select>

                                  {bid.payment_phone &&
                                    bid.payment_status !== "pending" && (
                                      <div className="flex items-center gap-1">
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                          {t("admin.paidFrom")}:
                                        </span>
                                        <span className="text-xs font-mono text-blue-600 dark:text-blue-400">
                                          📱 {bid.payment_phone}
                                        </span>
                                      </div>
                                    )}
                                </div>
                              )}
                            </div>
                          ) : (
                            /* Status Display - Show for active auctions */
                            <div className="flex flex-col items-end">
                              {bid.status && (
                                <p
                                  className={`text-xs font-medium transition-colors duration-200 ${
                                    bid.status === "won"
                                      ? "text-yellow-700 dark:text-yellow-300"
                                      : bid.status === "active"
                                      ? "text-green-600 dark:text-green-400"
                                      : "text-gray-500 dark:text-gray-400"
                                  }`}
                                >
                                  Status:{" "}
                                  {bid.status === "won"
                                    ? t("admin.statusWon")
                                    : bid.status === "active"
                                    ? t("admin.statusActive")
                                    : bid.status === "outbid"
                                    ? t("admin.statusOutbid")
                                    : bid.status.toUpperCase()}
                                </p>
                              )}
                              {bid.payment_status && bid.status === "won" && (
                                <div className="space-y-2">
                                  {/* Payment Status with Verification Notice */}
                                  {bid.payment_phone &&
                                  bid.payment_status === "pending" ? (
                                    <div className="p-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded">
                                      <div className="flex items-center gap-1 mb-1">
                                        <span className="text-xs font-semibold text-orange-600 dark:text-orange-400">
                                          🔔 AWAITING VERIFICATION
                                        </span>
                                      </div>
                                      <p className="text-xs text-orange-700 dark:text-orange-300 mb-1">
                                        Payment sent from:
                                      </p>
                                      <p className="text-xs font-mono font-bold text-orange-800 dark:text-orange-200 bg-orange-100 dark:bg-orange-800/30 px-2 py-1 rounded">
                                        📱 {bid.payment_phone}
                                      </p>
                                      <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                                        End auction to verify payment
                                      </p>
                                    </div>
                                  ) : (
                                    <div className="space-y-1">
                                      <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200">
                                        Payment:{" "}
                                        {bid.payment_status === "paid"
                                          ? t("admin.paymentPaid")
                                          : bid.payment_status === "cancelled"
                                          ? t("admin.paymentCancelled")
                                          : t("admin.paymentPending")}
                                      </p>
                                      {bid.payment_phone && (
                                        <div className="flex items-center gap-1">
                                          <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {t("admin.from")}:
                                          </span>
                                          <span className="text-xs font-mono text-blue-600 dark:text-blue-400">
                                            📱 {bid.payment_phone}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </li>
                    );
                  })}
              </ul>
            )}

            <div className="flex justify-end pt-6">
              <button
                type="button"
                onClick={handleCloseBidders}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
              >
                {t("admin.close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Payment Management Functions
export const markBidAsPaid = async (bidId: string) => {
  const { data, error } = await supabase
    .from("bids")
    .update({
      payment_status: "paid",
      payment_date: new Date().toISOString(),
    })
    .eq("id", bidId)
    .select();

  if (error) {
    throw error;
  }
  return data;
};

export const markBidPaymentCancelled = async (bidId: string) => {
  const { data, error } = await supabase
    .from("bids")
    .update({
      payment_status: "cancelled",
    })
    .eq("id", bidId)
    .select();

  if (error) {
    throw error;
  }
  return data;
};

// Auction Management Functions
export const endAuction = async (productId: string) => {
  const { data, error } = await supabase.rpc("end_auction", {
    product_id_to_end: productId,
  });

  if (error) {
    throw error;
  }
  return data;
};

export const testEndAuctions = async () => {
  const { data, error } = await supabase.rpc("test_end_auctions");

  if (error) {
    throw error;
  }
  return data;
};

export const debugProductBids = async (productId: string) => {
  const { data, error } = await supabase.rpc("debug_product_bids", {
    product_id_param: productId,
  });

  if (error) {
    throw error;
  }
  return data;
};

export type Profile = {
  id: string;
  full_name: string;
  avatar_url?: string;
  phone?: string;
  address?: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
};

export type Product = {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  starting_price: number;
  current_price: number;
  seller_id?: string;
  status: "active" | "ended" | "pending";
  end_time?: string;
  category?: string;
  location?: string;
  condition?: string;
  created_at: string;
  updated_at: string;
};

export type Bid = {
  id: string;
  product_id: string;
  bidder_id: string;
  amount: number;
  status: "active" | "outbid" | "won" | "ended";
  payment_status?: "pending" | "paid" | "cancelled";
  payment_date?: string;
  payment_phone?: string;
  created_at: string;
};

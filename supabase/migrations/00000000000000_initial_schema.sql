/*
  # FYNDAK Complete Schema Setup
  
  This migration sets up the complete database schema for the FYNDAK auction application.
  It includes all tables, functions, policies, and storage setup needed for new deployments.
  
  ## Key Features:
  - Robust user profile creation with error handling
  - Comprehensive RLS policies for security
  - Auction management functions with automatic ending
  - Storage bucket setup for product images
  - Proper permissions and indexes for performance
  
  ## Version: Fixed profile creation trigger (October 2025)
  - Added exception handling to prevent signup failures
  - Improved security with explicit schema paths
  - Enhanced error logging for debugging
*/

-- ============================================================================
-- TABLES
-- ============================================================================

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  address TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  starting_price DECIMAL(10,2) NOT NULL CHECK (starting_price > 0),
  current_price DECIMAL(10,2) NOT NULL CHECK (current_price >= starting_price),
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('active', 'ended', 'pending')) DEFAULT 'active',
  end_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bids table
CREATE TABLE IF NOT EXISTS bids (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  bidder_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  status TEXT CHECK (status IN ('active', 'outbid', 'won')) DEFAULT 'active',
  payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'cancelled')) DEFAULT 'pending',
  payment_phone TEXT,
  payment_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(product_id, bidder_id, amount)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_end_time ON products(end_time);
CREATE INDEX IF NOT EXISTS idx_bids_product_id ON bids(product_id);
CREATE INDEX IF NOT EXISTS idx_bids_bidder_id ON bids(bidder_id);
CREATE INDEX IF NOT EXISTS idx_bids_status ON bids(status);
CREATE INDEX IF NOT EXISTS idx_bids_payment_status ON bids(payment_status);
CREATE INDEX IF NOT EXISTS idx_bids_status_payment ON bids(status, payment_status);

-- ============================================================================
-- VIEWS
-- ============================================================================

-- Profiles with email view
CREATE OR REPLACE VIEW profiles_with_email AS
SELECT
  p.id,
  p.full_name,
  p.avatar_url,
  p.phone,
  p.address,
  p.is_admin,
  p.created_at,
  p.updated_at,
  u.email
FROM
  profiles p
  JOIN auth.users u ON p.id = u.id;

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to automatically create profile on user signup
-- Fixed version with proper error handling and security
CREATE OR REPLACE FUNCTION create_profile_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into profiles table with explicit schema reference
  INSERT INTO public.profiles (id, full_name, avatar_url, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    NOW(),
    NOW()
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Profile already exists, that's fine
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log the error but don't fail the signup process
    RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to end auctions automatically
CREATE OR REPLACE FUNCTION end_auctions() RETURNS void AS $$
DECLARE
  ended_product RECORD;
  winning_bid RECORD;
  products_processed INTEGER := 0;
  bids_updated INTEGER := 0;
BEGIN
  -- Find and process ended products
  FOR ended_product IN
    SELECT id, name, end_time, status FROM products
    WHERE end_time IS NOT NULL 
      AND end_time <= now() 
      AND status = 'active'
  LOOP
    products_processed := products_processed + 1;
    
    -- Find the winning bid (highest amount)
    SELECT * INTO winning_bid
    FROM bids
    WHERE product_id = ended_product.id
      AND status IN ('active', 'outbid')
    ORDER BY amount DESC, created_at ASC
    LIMIT 1;

    -- Update product status to ended
    UPDATE products 
    SET status = 'ended', updated_at = now()
    WHERE id = ended_product.id;

    IF winning_bid.id IS NOT NULL THEN
      -- Set winning bid status to 'won'
      UPDATE bids 
      SET status = 'won'
      WHERE id = winning_bid.id;
      
      -- Set all other bids for this product to 'outbid'
      UPDATE bids 
      SET status = 'outbid'
      WHERE product_id = ended_product.id 
        AND id != winning_bid.id
        AND status = 'active';
        
      GET DIAGNOSTICS bids_updated = ROW_COUNT;
    ELSE
      -- No bids found, set all bids to outbid
      UPDATE bids 
      SET status = 'outbid'
      WHERE product_id = ended_product.id 
        AND status = 'active';
    END IF;
  END LOOP;

  -- Log completion
  RAISE NOTICE 'end_auctions completed: % products processed, % bids updated', products_processed, bids_updated;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to end auction manually (RPC)
CREATE OR REPLACE FUNCTION end_auction_rpc(product_uuid UUID)
RETURNS JSON AS $$
DECLARE
  target_product RECORD;
  winning_bid RECORD;
  result JSON;
BEGIN
  -- Check if product exists and is active
  SELECT * INTO target_product
  FROM products
  WHERE id = product_uuid AND status = 'active';

  IF target_product.id IS NULL THEN
    RETURN JSON_BUILD_OBJECT(
      'success', false,
      'error', 'Product not found or not active'
    );
  END IF;

  -- Find the winning bid
  SELECT * INTO winning_bid
  FROM bids
  WHERE product_id = product_uuid
    AND status IN ('active', 'outbid')
  ORDER BY amount DESC, created_at ASC
  LIMIT 1;

  -- End the auction
  UPDATE products 
  SET status = 'ended', updated_at = now()
  WHERE id = product_uuid;

  IF winning_bid.id IS NOT NULL THEN
    -- Update winning bid
    UPDATE bids 
    SET status = 'won'
    WHERE id = winning_bid.id;
    
    -- Update other bids
    UPDATE bids 
    SET status = 'outbid'
    WHERE product_id = product_uuid 
      AND id != winning_bid.id
      AND status IN ('active', 'outbid');

    result := JSON_BUILD_OBJECT(
      'success', true,
      'winning_bid_id', winning_bid.id,
      'winning_amount', winning_bid.amount,
      'winner_id', winning_bid.bidder_id
    );
  ELSE
    result := JSON_BUILD_OBJECT(
      'success', true,
      'winning_bid_id', null,
      'message', 'No bids found'
    );
  END IF;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS create_profile_trigger ON auth.users;
CREATE TRIGGER create_profile_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_profile_for_new_user();

-- Triggers to update updated_at column
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Products policies
CREATE POLICY "Anyone can view active products" ON products FOR SELECT USING (status = 'active' OR auth.role() = 'authenticated');
CREATE POLICY "Admins can insert products" ON products FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "Admins can update products" ON products FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "Admins can delete products" ON products FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Bids policies
CREATE POLICY "Users can view bids for products they bid on or own" ON bids FOR SELECT USING (
  bidder_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM products WHERE id = bids.product_id AND seller_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "Authenticated users can insert bids" ON bids FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' AND bidder_id = auth.uid()
);
CREATE POLICY "Users can update their own bids" ON bids FOR UPDATE USING (bidder_id = auth.uid());
CREATE POLICY "Admins can update any bid" ON bids FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- ============================================================================
-- PERMISSIONS
-- ============================================================================

-- Ensure proper permissions for the profile creation function
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.profiles TO postgres, anon, authenticated, service_role;

-- ============================================================================
-- STORAGE SETUP
-- ============================================================================

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated users to upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to product images" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin users to delete product images" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin users to update product images" ON storage.objects;

-- Storage policies
CREATE POLICY "Allow authenticated users to upload product images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-images' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Allow public read access to product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Allow admin users to delete product images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'product-images' 
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Allow admin users to update product images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'product-images' 
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE profiles IS 'Extended user profiles linked to auth.users';
COMMENT ON TABLE products IS 'Auction products/items';
COMMENT ON TABLE bids IS 'User bids on products';
COMMENT ON COLUMN bids.payment_status IS 'Payment status for won bids: pending, paid, cancelled';
COMMENT ON COLUMN bids.payment_phone IS 'Phone number used by user for Swish payment verification';
COMMENT ON COLUMN bids.payment_date IS 'Timestamp when payment was confirmed';

-- ============================================================================
-- COMPLETION
-- ============================================================================

-- Log successful completion
DO $$
BEGIN
  RAISE NOTICE 'FYNDAK schema setup completed successfully at %', now();
END $$;
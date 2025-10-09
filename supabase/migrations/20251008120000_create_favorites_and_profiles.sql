/*
  # Add Favorites and User Profiles

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `full_name` (text)
      - `phone` (text)
      - `address` (text)
      - `avatar_url` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `favorites`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `product_id` (uuid, references products)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data
    - Users can only read/write their own profiles and favorites

  3. Indexes
    - Add index on favorites(user_id, product_id) for quick lookups
    - Add unique constraint to prevent duplicate favorites
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  address text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Create index for favorites
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_product_id ON favorites(product_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_product ON favorites(user_id, product_id);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policies for favorites
CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites"
  ON favorites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove favorites"
  ON favorites FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

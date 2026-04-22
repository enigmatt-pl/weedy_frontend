/*
  # Create Listings Table

  1. New Tables
    - `listings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `oem_number` (text, OEM part number)
      - `title` (text, generated listing title)
      - `description` (text, generated listing description)
      - `estimated_price` (decimal, auto-calculated price)
      - `images` (jsonb, array of image URLs)
      - `status` (text, draft/published/pushed)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  
  2. Security
    - Enable RLS on `listings` table
    - Add policy for authenticated users to read own listings
    - Add policy for authenticated users to insert own listings
    - Add policy for authenticated users to update own listings
    - Add policy for authenticated users to delete own listings
*/

CREATE TABLE IF NOT EXISTS listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  oem_number text NOT NULL,
  title text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  estimated_price decimal(10,2) DEFAULT 0,
  images jsonb DEFAULT '[]'::jsonb,
  status text DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own listings"
  ON listings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own listings"
  ON listings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own listings"
  ON listings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own listings"
  ON listings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_listings_user_id ON listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings(created_at DESC);
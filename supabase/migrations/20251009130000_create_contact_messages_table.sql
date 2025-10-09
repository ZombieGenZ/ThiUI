/*
  # Create Contact Messages Table

  1. New Tables
    - `contact_messages`
      - `id` (uuid, primary key) - Unique identifier for each message
      - `user_id` (uuid, nullable) - Reference to user who sent the message (if authenticated)
      - `name` (text) - Name of the person contacting
      - `email` (text) - Email address for contact
      - `phone` (text, optional) - Phone number if provided
      - `subject` (text) - Subject of the inquiry
      - `message` (text) - The actual message content
      - `status` (text) - Status of the message: pending, read, replied, closed
      - `created_at` (timestamptz) - When the message was sent
      - `updated_at` (timestamptz) - When the message was last updated

  2. Security
    - Enable RLS on `contact_messages` table
    - Authenticated users can insert their own messages
    - Authenticated users can view their own messages
    - Public users can insert messages (unauthenticated)

  3. Indexes
    - Add index on user_id for faster lookups
    - Add index on status for filtering
    - Add index on created_at for sorting
*/

-- Create contact_messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text DEFAULT '',
  subject text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'read', 'replied', 'closed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_contact_messages_user_id ON contact_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);

-- Enable RLS
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can view own messages" ON contact_messages;
  DROP POLICY IF EXISTS "Authenticated users can insert messages" ON contact_messages;
  DROP POLICY IF EXISTS "Anonymous users can insert messages" ON contact_messages;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Policies for contact_messages
CREATE POLICY "Users can view own messages"
  ON contact_messages FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert messages"
  ON contact_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Anonymous users can insert messages"
  ON contact_messages FOR INSERT
  TO anon
  WITH CHECK (true);

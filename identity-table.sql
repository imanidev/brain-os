-- Create identity_entries table
-- Each entry links evidence (what you did) to identity (what it proves)
CREATE TABLE IF NOT EXISTS identity_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  evidence TEXT NOT NULL,
  identity TEXT NOT NULL,
  date TEXT NOT NULL,
  CONSTRAINT evidence_length CHECK (char_length(evidence) <= 200),
  CONSTRAINT identity_length CHECK (char_length(identity) <= 100)
);

-- Index for fetching entries
CREATE INDEX IF NOT EXISTS idx_identity_entries_date
  ON identity_entries(date DESC, created_at DESC);

-- Index for grouping by identity statement
CREATE INDEX IF NOT EXISTS idx_identity_entries_identity
  ON identity_entries(identity);

-- Enable Row Level Security
ALTER TABLE identity_entries ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations
CREATE POLICY "Allow all operations" ON identity_entries
  FOR ALL
  USING (true)
  WITH CHECK (true);

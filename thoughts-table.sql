-- Create thoughts table
-- Capture negative thoughts quickly, reframe them later
CREATE TABLE IF NOT EXISTS thoughts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  thought TEXT NOT NULL,
  reframe TEXT,
  reframed_at TIMESTAMP WITH TIME ZONE,
  date TEXT NOT NULL,
  CONSTRAINT thought_length CHECK (char_length(thought) <= 300),
  CONSTRAINT reframe_length CHECK (char_length(reframe) <= 300)
);

-- Index for fetching thoughts by date
CREATE INDEX IF NOT EXISTS idx_thoughts_date
  ON thoughts(date DESC, created_at DESC);

-- Index for finding unreframed thoughts
CREATE INDEX IF NOT EXISTS idx_thoughts_unreframed
  ON thoughts(reframed_at) WHERE reframed_at IS NULL;

-- Enable Row Level Security
ALTER TABLE thoughts ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations
CREATE POLICY "Allow all operations" ON thoughts
  FOR ALL
  USING (true)
  WITH CHECK (true);

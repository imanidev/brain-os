-- Create distractions table
-- Log what pulled you away from focus
CREATE TABLE IF NOT EXISTS distractions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  distraction TEXT NOT NULL,
  date TEXT NOT NULL,
  CONSTRAINT distraction_length CHECK (char_length(distraction) <= 200)
);

-- Index for fetching distractions by date
CREATE INDEX IF NOT EXISTS idx_distractions_date
  ON distractions(date DESC, created_at DESC);

-- Enable Row Level Security
ALTER TABLE distractions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations
CREATE POLICY "Allow all operations" ON distractions
  FOR ALL
  USING (true)
  WITH CHECK (true);

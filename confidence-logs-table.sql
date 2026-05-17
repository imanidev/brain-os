-- Create confidence_logs table
CREATE TABLE IF NOT EXISTS confidence_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  win TEXT NOT NULL,
  date TEXT NOT NULL,
  CONSTRAINT win_length CHECK (char_length(win) <= 200)
);

-- Index for fetching today's wins (most common query)
CREATE INDEX IF NOT EXISTS idx_confidence_logs_date_created
  ON confidence_logs(date, created_at DESC);

-- Enable Row Level Security
ALTER TABLE confidence_logs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations
CREATE POLICY "Allow all operations" ON confidence_logs
  FOR ALL
  USING (true)
  WITH CHECK (true);

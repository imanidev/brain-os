-- Create check_ins table
CREATE TABLE IF NOT EXISTS check_ins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  mood TEXT NOT NULL CHECK (mood IN ('thriving', 'steady', 'struggling', 'offline')),
  one_task TEXT NOT NULL,
  committed BOOLEAN DEFAULT false,
  date TEXT NOT NULL,
  UNIQUE(date)
);

-- Enable Row Level Security
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (read, insert, update, delete)
-- For a personal app with anon key
CREATE POLICY "Allow all operations" ON check_ins
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create index on date for faster queries
CREATE INDEX IF NOT EXISTS idx_check_ins_date ON check_ins(date);
CREATE INDEX IF NOT EXISTS idx_check_ins_committed_date ON check_ins(committed, date DESC);

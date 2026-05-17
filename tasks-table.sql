-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  task TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  date TEXT NOT NULL, -- YYYY-MM-DD
  archived BOOLEAN DEFAULT false,
  CONSTRAINT task_length CHECK (char_length(task) <= 200)
);

-- Index for fetching today's tasks
CREATE INDEX IF NOT EXISTS idx_tasks_date_archived
  ON tasks(date, archived, created_at);

-- Enable Row Level Security
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations
CREATE POLICY "Allow all operations" ON tasks
  FOR ALL
  USING (true)
  WITH CHECK (true);

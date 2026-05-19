import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Mood = 'thriving' | 'steady' | 'struggling' | 'offline'

export interface CheckIn {
  id?: string
  created_at?: string
  mood: Mood
  one_task: string
  committed: boolean
  date: string // YYYY-MM-DD
}

export interface ConfidenceLog {
  id?: string
  created_at?: string
  win: string
  date: string // YYYY-MM-DD
}

export interface Task {
  id?: string
  created_at?: string
  task: string
  completed: boolean
  completed_at?: string
  date: string // YYYY-MM-DD
  archived: boolean
}

export interface IdentityEntry {
  id?: string
  created_at?: string
  evidence: string
  identity: string
  date: string // YYYY-MM-DD
}

export interface Thought {
  id?: string
  created_at?: string
  thought: string
  reframe?: string
  reframed_at?: string
  date: string // YYYY-MM-DD
}

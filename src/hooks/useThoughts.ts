import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Thought } from '../lib/supabase'

export function useThoughts() {
  const [thoughts, setThoughts] = useState<Thought[]>([])
  const [loading, setLoading] = useState(true)
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    fetchThoughts()
  }, [])

  async function fetchThoughts() {
    const { data, error } = await supabase
      .from('thoughts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Fetch thoughts error:', error)
    } else {
      setThoughts(data ?? [])
    }
    setLoading(false)
  }

  // Quick capture - just the thought, no reframe yet
  async function captureThought(thought: string): Promise<{ success: boolean; error?: string }> {
    const { data, error } = await supabase
      .from('thoughts')
      .insert({
        thought: thought.trim(),
        date: today,
      })
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    setThoughts(prev => [data, ...prev])
    return { success: true }
  }

  // Add reframe to an existing thought
  async function reframeThought(
    id: string,
    reframe: string
  ): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
      .from('thoughts')
      .update({
        reframe: reframe.trim(),
        reframed_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    setThoughts(prev =>
      prev.map(t =>
        t.id === id
          ? { ...t, reframe: reframe.trim(), reframed_at: new Date().toISOString() }
          : t
      )
    )
    return { success: true }
  }

  async function deleteThought(id: string): Promise<void> {
    setThoughts(prev => prev.filter(t => t.id !== id))

    const { error } = await supabase
      .from('thoughts')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Delete thought error:', error)
      await fetchThoughts()
    }
  }

  // Get thoughts that haven't been reframed yet
  const unreframedThoughts = thoughts.filter(t => !t.reframe)
  const reframedThoughts = thoughts.filter(t => t.reframe)

  return {
    thoughts,
    unreframedThoughts,
    reframedThoughts,
    unreframedCount: unreframedThoughts.length,
    loading,
    today,
    captureThought,
    reframeThought,
    deleteThought,
  }
}

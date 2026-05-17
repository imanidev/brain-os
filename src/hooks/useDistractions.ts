import { useEffect, useState, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import type { Distraction } from '../lib/supabase'

export function useDistractions() {
  const [distractions, setDistractions] = useState<Distraction[]>([])
  const [loading, setLoading] = useState(true)
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    fetchDistractions()
  }, [])

  async function fetchDistractions() {
    const { data, error } = await supabase
      .from('distractions')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Fetch distractions error:', error)
    } else {
      setDistractions(data ?? [])
    }
    setLoading(false)
  }

  async function logDistraction(distraction: string): Promise<{ success: boolean; error?: string }> {
    const { data, error } = await supabase
      .from('distractions')
      .insert({
        distraction: distraction.trim(),
        date: today,
      })
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    setDistractions(prev => [data, ...prev])
    return { success: true }
  }

  async function deleteDistraction(id: string): Promise<void> {
    setDistractions(prev => prev.filter(d => d.id !== id))

    const { error } = await supabase
      .from('distractions')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Delete distraction error:', error)
      await fetchDistractions()
    }
  }

  // Group by common distractions to show patterns
  const patterns = useMemo(() => {
    const counts = new Map<string, number>()
    for (const d of distractions) {
      const lower = d.distraction.toLowerCase()
      counts.set(lower, (counts.get(lower) ?? 0) + 1)
    }
    return Array.from(counts.entries())
      .filter(([, count]) => count > 1)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
  }, [distractions])

  const todayCount = distractions.filter(d => d.date === today).length

  return {
    distractions,
    todayCount,
    patterns,
    loading,
    today,
    logDistraction,
    deleteDistraction,
  }
}

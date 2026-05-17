import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { ConfidenceLog } from '../lib/supabase'

export function useConfidenceLogs() {
  const [wins, setWins] = useState<ConfidenceLog[]>([])
  const [loading, setLoading] = useState(true)
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    async function fetchWins() {
      const { data, error } = await supabase
        .from('confidence_logs')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Fetch wins error:', error)
      } else {
        setWins(data ?? [])
      }
      setLoading(false)
    }
    fetchWins()
  }, [])

  async function addWin(win: string): Promise<{ success: boolean; error?: string }> {
    // Optimistic update
    const tempId = crypto.randomUUID()
    const tempWin: ConfidenceLog = {
      id: tempId,
      win,
      date: today,
      created_at: new Date().toISOString(),
    }
    setWins(prev => [tempWin, ...prev])

    const { data, error } = await supabase
      .from('confidence_logs')
      .insert({ win, date: today })
      .select()
      .single()

    if (error) {
      // Rollback optimistic update
      setWins(prev => prev.filter(w => w.id !== tempId))
      return { success: false, error: error.message }
    }

    // Replace temp with real data
    setWins(prev => prev.map(w => w.id === tempId ? data : w))
    return { success: true }
  }

  async function deleteWin(id: string): Promise<{ success: boolean }> {
    // Optimistic update
    setWins(prev => prev.filter(w => w.id !== id))

    const { error } = await supabase
      .from('confidence_logs')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Delete win error:', error)
      // Rollback would require storing deleted item - skip for simplicity
      return { success: false }
    }

    return { success: true }
  }

  return { wins, loading, today, addWin, deleteWin }
}

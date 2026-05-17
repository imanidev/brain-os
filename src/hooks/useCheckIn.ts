import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { CheckIn } from '../lib/supabase'

export function useTodayCheckIn() {
  const [checkIn, setCheckIn] = useState<CheckIn | null>(null)
  const [loading, setLoading] = useState(true)

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    async function fetch() {
      const { data, error } = await supabase
        .from('check_ins')
        .select('*')
        .eq('date', today)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Today check-in fetch error:', error)
      }

      setCheckIn(data ?? null)
      setLoading(false)
    }
    fetch()
  }, [today])

  return { checkIn, loading, today }
}

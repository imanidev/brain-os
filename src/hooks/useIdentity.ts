import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { IdentityEntry } from '../lib/supabase'

export interface GroupedIdentity {
  identity: string
  entries: IdentityEntry[]
  count: number
}

export function useIdentity() {
  const [entries, setEntries] = useState<IdentityEntry[]>([])
  const [loading, setLoading] = useState(true)
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    fetchEntries()
  }, [])

  async function fetchEntries() {
    const { data, error } = await supabase
      .from('identity_entries')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Fetch identity entries error:', error)
    } else {
      setEntries(data ?? [])
    }
    setLoading(false)
  }

  // Group entries by identity statement
  function getGroupedIdentities(): GroupedIdentity[] {
    const grouped = new Map<string, IdentityEntry[]>()

    for (const entry of entries) {
      const existing = grouped.get(entry.identity) ?? []
      grouped.set(entry.identity, [...existing, entry])
    }

    return Array.from(grouped.entries())
      .map(([identity, entries]) => ({
        identity,
        entries,
        count: entries.length,
      }))
      .sort((a, b) => b.count - a.count)
  }

  // Get unique identity statements for autocomplete
  function getIdentityStatements(): string[] {
    const unique = new Set(entries.map(e => e.identity))
    return Array.from(unique).sort()
  }

  async function addEntry(
    evidence: string,
    identity: string
  ): Promise<{ success: boolean; error?: string }> {
    const { data, error } = await supabase
      .from('identity_entries')
      .insert({
        evidence: evidence.trim(),
        identity: identity.trim(),
        date: today,
      })
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    setEntries(prev => [data, ...prev])
    return { success: true }
  }

  async function deleteEntry(id: string): Promise<void> {
    setEntries(prev => prev.filter(e => e.id !== id))

    const { error } = await supabase
      .from('identity_entries')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Delete identity entry error:', error)
      await fetchEntries()
    }
  }

  return {
    entries,
    loading,
    today,
    groupedIdentities: getGroupedIdentities(),
    identityStatements: getIdentityStatements(),
    addEntry,
    deleteEntry,
  }
}

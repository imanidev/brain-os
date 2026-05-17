import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Task } from '../lib/supabase'

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [hasYesterdayTasks, setHasYesterdayTasks] = useState(false)
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    fetchTasks()
  }, [])

  async function fetchTasks() {
    // Fetch today's non-archived tasks
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('date', today)
      .eq('archived', false)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Fetch tasks error:', error)
    } else {
      setTasks(data ?? [])
    }

    // Check for yesterday's incomplete tasks
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    const { data: yesterdayData } = await supabase
      .from('tasks')
      .select('id')
      .eq('date', yesterdayStr)
      .eq('completed', false)
      .eq('archived', false)

    setHasYesterdayTasks((yesterdayData?.length ?? 0) > 0)
    setLoading(false)
  }

  async function addTask(task: string): Promise<{ success: boolean; error?: string }> {
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        task: task.trim(),
        completed: false,
        date: today,
        archived: false,
      })
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    setTasks(prev => [...prev, data])
    return { success: true }
  }

  async function toggleTask(id: string, completed: boolean): Promise<void> {
    // Optimistic update
    setTasks(prev =>
      prev.map(t =>
        t.id === id
          ? { ...t, completed, completed_at: completed ? new Date().toISOString() : undefined }
          : t
      )
    )

    const { error } = await supabase
      .from('tasks')
      .update({
        completed,
        completed_at: completed ? new Date().toISOString() : null,
      })
      .eq('id', id)

    if (error) {
      console.error('Toggle task error:', error)
      // Rollback
      await fetchTasks()
    }
  }

  async function deleteTask(id: string): Promise<void> {
    setTasks(prev => prev.filter(t => t.id !== id))

    const { error } = await supabase.from('tasks').delete().eq('id', id)

    if (error) {
      console.error('Delete task error:', error)
      await fetchTasks()
    }
  }

  async function archiveYesterdayTasks(): Promise<void> {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    const { error } = await supabase
      .from('tasks')
      .update({ archived: true })
      .eq('date', yesterdayStr)
      .eq('archived', false)

    if (error) {
      console.error('Archive tasks error:', error)
    } else {
      setHasYesterdayTasks(false)
    }
  }

  async function carryOverYesterdayTasks(): Promise<void> {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    // Fetch yesterday's incomplete tasks
    const { data: yesterdayTasks, error: fetchError } = await supabase
      .from('tasks')
      .select('*')
      .eq('date', yesterdayStr)
      .eq('completed', false)
      .eq('archived', false)

    if (fetchError || !yesterdayTasks) {
      console.error('Fetch yesterday tasks error:', fetchError)
      return
    }

    // Create new tasks for today
    const newTasks = yesterdayTasks.map(t => ({
      task: t.task,
      completed: false,
      date: today,
      archived: false,
    }))

    const { data: insertedTasks, error: insertError } = await supabase
      .from('tasks')
      .insert(newTasks)
      .select()

    if (insertError) {
      console.error('Carry over tasks error:', insertError)
      return
    }

    // Archive yesterday's tasks
    await supabase
      .from('tasks')
      .update({ archived: true })
      .eq('date', yesterdayStr)
      .eq('archived', false)

    setTasks(prev => [...prev, ...(insertedTasks ?? [])])
    setHasYesterdayTasks(false)
  }

  return {
    tasks,
    loading,
    today,
    hasYesterdayTasks,
    addTask,
    toggleTask,
    deleteTask,
    archiveYesterdayTasks,
    carryOverYesterdayTasks,
  }
}

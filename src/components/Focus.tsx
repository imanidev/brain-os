import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import type { Mood } from '../lib/supabase'
import { useTodayCheckIn } from '../hooks/useCheckIn'
import { useTasks } from '../hooks/useTasks'
import '../styles/Focus.css'

const MOODS: { value: Mood; label: string; sub: string }[] = [
  { value: 'thriving',   label: 'thriving',   sub: 'dialed in'     },
  { value: 'steady',     label: 'steady',     sub: 'showing up'    },
  { value: 'struggling', label: 'struggling', sub: 'still here'    },
  { value: 'offline',    label: 'offline',    sub: 'just existing' },
]

export default function Focus() {
  const { checkIn: existing, loading, today } = useTodayCheckIn()
  const {
    tasks,
    loading: tasksLoading,
    hasYesterdayTasks,
    addTask,
    toggleTask,
    deleteTask,
    archiveYesterdayTasks,
    carryOverYesterdayTasks
  } = useTasks()

  const [mood, setMood] = useState<Mood | null>(null)
  const [task, setTask] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [taskInput, setTaskInput] = useState('')
  const [savingTask, setSavingTask] = useState(false)
  const [taskError, setTaskError] = useState<string | null>(null)
  const [focusCompleted, setFocusCompleted] = useState(false)
  const [pendingLog, setPendingLog] = useState<{ id: string; task: string } | null>(null)
  const dismissTimer = useRef<number | null>(null)

  useEffect(() => {
    return () => { if (dismissTimer.current) clearTimeout(dismissTimer.current) }
  }, [])

  function scheduleDismiss() {
    if (dismissTimer.current) clearTimeout(dismissTimer.current)
    dismissTimer.current = window.setTimeout(() => setPendingLog(null), 8000)
  }

  async function handleToggle(id: string, taskText: string, completed: boolean) {
    await toggleTask(id, completed)
    if (completed) {
      setPendingLog({ id, task: taskText })
      scheduleDismiss()
    } else {
      if (pendingLog?.id === id) setPendingLog(null)
    }
  }

  async function handleLogWin() {
    if (!pendingLog) return
    await supabase
      .from('confidence_logs')
      .insert({ win: pendingLog.task, date: today })
    setPendingLog(null)
    if (dismissTimer.current) clearTimeout(dismissTimer.current)
  }

  function handleSkip() {
    setPendingLog(null)
    if (dismissTimer.current) clearTimeout(dismissTimer.current)
  }

  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  function formatTimestamp(isoString: string) {
    const date = new Date(isoString)
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const year = date.getFullYear()
    return `${month}/${day}/${year}`
  }

  async function handleCommit() {
    if (!mood || !task.trim()) return
    setSaving(true)
    setError(null)

    const { error: err } = await supabase.from('check_ins').upsert({
      mood,
      one_task: task.trim(),
      committed: true,
      date: today,
    }, { onConflict: 'date' })

    if (err) {
      console.error('Supabase error:', err)
      setError(`Error: ${err.message || 'Could not save. Check your Supabase connection.'}`)
      setSaving(false)
      return
    }

    setSubmitted(true)
    setSaving(false)
  }

  async function handleAddTask() {
    if (!taskInput.trim()) return
    setSavingTask(true)
    setTaskError(null)

    const result = await addTask(taskInput.trim())

    if (result.success) {
      setTaskInput('')
    } else {
      setTaskError(result.error ?? 'Could not save task')
    }
    setSavingTask(false)
  }

  if (loading || tasksLoading) {
    return (
      <div className="focus-shell">
        <p className="focus-loading">loading…</p>
      </div>
    )
  }

  const isDialedIn = submitted || existing?.committed

  if (isDialedIn) {
    const displayMood = existing?.mood ?? mood
    const displayTask = existing?.one_task ?? task
    const timestamp = existing?.created_at ? formatTimestamp(existing.created_at) : null

    return (
      <div className="focus-shell">
        <div className="focus-container">
          <div className="focus-card committed">
            {!focusCompleted ? (
              <>
                <h1 className="committed-headline">you're dialed in.</h1>
                <p className="committed-task">your one thing — <strong>{displayTask}</strong></p>
                <p className="committed-mood">
                  feeling {MOODS.find(m => m.value === displayMood)?.label ?? displayMood}
                </p>
                {timestamp && (
                  <p className="committed-timestamp">set on {timestamp}</p>
                )}
                <button
                  className="complete-focus-btn"
                  onClick={() => setFocusCompleted(true)}
                >
                  mark done →
                </button>
                <p className="focus-note">finish this before adding more.</p>
              </>
            ) : (
              <>
                <h1 className="committed-headline">done.</h1>
                <p className="committed-task"><strong>{displayTask}</strong> ✓</p>
                <p className="focus-note">add more now.</p>
              </>
            )}
          </div>

          {focusCompleted && (
            <div className="focus-card">
              <h2 className="task-list-title">tasks</h2>
              <p className="task-list-sub">add more when you're in flow.</p>

              {hasYesterdayTasks && (
                <div className="yesterday-prompt">
                  <p className="yesterday-text">yesterday's leftovers:</p>
                  <div className="yesterday-actions">
                    <button className="yesterday-btn" onClick={carryOverYesterdayTasks}>
                      carry over
                    </button>
                    <button className="yesterday-btn secondary" onClick={archiveYesterdayTasks}>
                      archive
                    </button>
                  </div>
                </div>
              )}

              <div className="task-input-row">
                <input
                  className="task-input"
                  type="text"
                  placeholder="add a task..."
                  value={taskInput}
                  onChange={e => setTaskInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddTask()}
                  maxLength={200}
                  disabled={savingTask}
                />
                <button
                  className="add-task-btn"
                  onClick={handleAddTask}
                  disabled={!taskInput.trim() || savingTask}
                >
                  {savingTask ? '...' : 'add'}
                </button>
              </div>

              {taskError && <p className="error-msg">{taskError}</p>}

              {tasks.length > 0 && (
                <ul className="task-list">
                  {tasks.map(t => (
                    <li key={t.id} className="task-item">
                      <label className="task-checkbox-wrapper">
                        <input
                          type="checkbox"
                          checked={t.completed}
                          onChange={e => handleToggle(t.id!, t.task, e.target.checked)}
                        />
                        <span className={`task-text ${t.completed ? 'completed' : ''}`}>
                          {t.task}
                        </span>
                      </label>
                      <button
                        className="delete-task-btn"
                        onClick={() => deleteTask(t.id!)}
                        aria-label="Delete task"
                      >
                        ✕
                      </button>
                      {pendingLog?.id === t.id && (
                        <div className="log-nudge">
                          <span className="log-nudge-text">log as a win?</span>
                          <button className="log-nudge-btn yes" onClick={handleLogWin}>log it</button>
                          <button className="log-nudge-btn skip" onClick={handleSkip}>skip</button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="focus-shell">
      <div className="focus-card">

        <div className="focus-header">
          <h1 className="focus-greeting">{greeting.toLowerCase()}, imani.</h1>
          <p className="focus-sub">one check-in. one task. that's it.</p>
        </div>

        <div className="section">
          <label className="section-label">how are you showing up?</label>
          <div className="mood-grid">
            {MOODS.map(m => (
              <button
                key={m.value}
                className={`mood-btn ${mood === m.value ? 'active' : ''}`}
                onClick={() => setMood(m.value)}
              >
                <span className="mood-label">{m.label}</span>
                <span className="mood-sub">{m.sub}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="section">
          <label className="section-label" htmlFor="task-input">
            what's your one thing?
          </label>
          <input
            id="task-input"
            className="task-input"
            type="text"
            placeholder="be specific. one thing."
            value={task}
            onChange={e => setTask(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCommit()}
            maxLength={120}
          />
          <p className="char-count">{task.length}/120</p>
        </div>

        {error && <p className="error-msg">{error}</p>}

        <button
          className="commit-btn"
          onClick={handleCommit}
          disabled={!mood || !task.trim() || saving}
        >
          {saving ? 'dialing in…' : 'commit →'}
        </button>

      </div>
    </div>
  )
}

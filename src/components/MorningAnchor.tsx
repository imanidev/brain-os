import { useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Mood } from '../lib/supabase'
import { useTodayCheckIn } from '../hooks/useCheckIn'
import { useTasks } from '../hooks/useTasks'


const MOODS: { value: Mood; label: string; sub: string }[] = [
  { value: 'thriving', label: 'Thriving',   sub: 'locked in'       },
  { value: 'steady',   label: 'Steady',     sub: 'showing up'      },
  { value: 'struggling',label: 'Struggling', sub: 'still here'      },
  { value: 'offline',  label: 'Offline',    sub: 'just existing'   },
]

export default function MorningAnchor() {
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
  const [anchorCompleted, setAnchorCompleted] = useState(false)

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
      <div className="anchor-shell">
        <p className="anchor-loading">loading your brain…</p>
      </div>
    )
  }

  const isAnchored = submitted || existing?.committed

  if (isAnchored) {
    const displayMood = existing?.mood ?? mood
    const displayTask = existing?.one_task ?? task
    const timestamp = existing?.created_at ? formatTimestamp(existing.created_at) : null

    return (
      <div className="anchor-shell">
        <div className="anchor-container">
          <div className="anchor-card committed">
            {!anchorCompleted ? (
              <>
                <h1 className="committed-headline">You're anchored.</h1>
                <p className="committed-task">Your one thing: <strong>{displayTask}</strong></p>
                <p className="committed-mood">
                  Feeling {MOODS.find(m => m.value === displayMood)?.label ?? displayMood}
                </p>
                {timestamp && (
                  <p className="committed-timestamp">Locked in on {timestamp}</p>
                )}
                <button
                  className="complete-anchor-btn"
                  onClick={() => setAnchorCompleted(true)}
                >
                  Mark as done →
                </button>
                <p className="anchor-note">Complete this before adding more tasks.</p>
              </>
            ) : (
              <>
                <h1 className="committed-headline">Anchor complete.</h1>
                <p className="committed-task"><strong>{displayTask}</strong> ✓</p>
                <p className="anchor-note">You can add more tasks now.</p>
              </>
            )}
          </div>

          {/* Task List - Only shows AFTER anchor task is completed */}
          {anchorCompleted && (
            <div className="anchor-card">
            <h2 className="task-list-title">Tasks</h2>
            <p className="task-list-sub">Add more when you're in flow.</p>

            {/* Yesterday tasks prompt */}
            {hasYesterdayTasks && (
              <div className="yesterday-prompt">
                <p className="yesterday-text">Yesterday's incomplete tasks:</p>
                <div className="yesterday-actions">
                  <button
                    className="yesterday-btn"
                    onClick={carryOverYesterdayTasks}
                  >
                    Carry over
                  </button>
                  <button
                    className="yesterday-btn secondary"
                    onClick={archiveYesterdayTasks}
                  >
                    Archive
                  </button>
                </div>
              </div>
            )}

            {/* Add task */}
            <div className="task-input-row">
              <input
                className="task-input"
                type="text"
                placeholder="Add a task..."
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

            {/* Task list */}
            {tasks.length > 0 && (
              <ul className="task-list">
                {tasks.map(t => (
                  <li key={t.id} className="task-item">
                    <label className="task-checkbox-wrapper">
                      <input
                        type="checkbox"
                        checked={t.completed}
                        onChange={e => toggleTask(t.id!, e.target.checked)}
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
    <div className="anchor-shell">
      <div className="anchor-card">

        {/* Header */}
        <div className="anchor-header">
          <h1 className="anchor-greeting">{greeting}, Imani.</h1>
          <p className="anchor-sub">One check-in. One task. That's it.</p>
        </div>

        {/* Mood */}
        <div className="section">
          <label className="section-label">How are you showing up today?</label>
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

        {/* Task */}
        <div className="section">
          <label className="section-label" htmlFor="task-input">
            What's the ONE thing that matters today?
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

        {/* Error */}
        {error && <p className="error-msg">{error}</p>}

        {/* Commit */}
        <button
          className="commit-btn"
          onClick={handleCommit}
          disabled={!mood || !task.trim() || saving}
        >
          {saving ? 'locking in…' : 'commit to today →'}
        </button>

      </div>
    </div>
  )
}

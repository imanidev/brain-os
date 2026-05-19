import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useTodayCheckIn } from '../hooks/useCheckIn'
import { useTasks } from '../hooks/useTasks'
import '../styles/Dashboard.css'

export default function Dashboard() {
  const { checkIn, loading: checkInLoading } = useTodayCheckIn()
  const { tasks, loading: tasksLoading, toggleTask } = useTasks()
  const [pendingLog, setPendingLog] = useState<{ id: string; task: string } | null>(null)
  const dismissTimer = useRef<number | null>(null)

  const today = new Date().toISOString().split('T')[0]
  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'good morning' : hour < 17 ? 'good afternoon' : 'good evening'

  useEffect(() => {
    return () => {
      if (dismissTimer.current) clearTimeout(dismissTimer.current)
    }
  }, [])

  function scheduleDismiss() {
    if (dismissTimer.current) clearTimeout(dismissTimer.current)
    dismissTimer.current = window.setTimeout(() => setPendingLog(null), 8000)
  }

  async function handleToggle(id: string, task: string, completed: boolean) {
    await toggleTask(id, completed)
    if (completed) {
      setPendingLog({ id, task })
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

  if (checkInLoading || tasksLoading) {
    return (
      <div className="dash-shell">
        <p className="dash-loading">loading…</p>
      </div>
    )
  }

  const isDialedIn = checkIn?.committed
  const completed = tasks.filter(t => t.completed).length
  const total = tasks.length
  const allDone = total > 0 && completed === total
  const progress = total > 0 ? completed / total : 0

  return (
    <div className="dash-shell">
      {/* Thin top progress bar */}
      {isDialedIn && total > 0 && (
        <div className="dash-progress-track">
          <div
            className={`dash-progress-fill ${allDone ? 'complete' : ''}`}
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      )}

      <div className="dash-container">
        <header className="dash-header">
          <h1 className="dash-greeting">
            {allDone ? `${greeting}, imani. you did the thing.` : `${greeting}, imani.`}
          </h1>
          <p className="dash-date">
            {new Date()
              .toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })
              .toLowerCase()}
          </p>
        </header>

        {/* Your one thing */}
        <section className={`dash-focus ${allDone ? 'all-done' : ''}`}>
          {isDialedIn ? (
            <div className="focus-set">
              <span className="focus-label">your one thing</span>
              <p className="focus-task">{checkIn?.one_task}</p>
            </div>
          ) : (
            <Link to="/focus" className="focus-cta">
              <span className="focus-label">not dialed in yet</span>
              <p className="focus-cta-text">set your one thing →</p>
            </Link>
          )}
        </section>

        {/* Tasks at-a-glance */}
        {isDialedIn && (
          <section className="dash-tasks">
            <div className="tasks-head">
              <span className="tasks-label">tasks</span>
              <span className={`tasks-count ${allDone ? 'all-done' : ''}`}>
                {allDone ? 'all done.' : `${completed}/${total} done`}
              </span>
            </div>

            {tasks.length === 0 ? (
              <Link to="/focus" className="tasks-empty">
                add tasks →
              </Link>
            ) : (
              <ul className="dash-task-list">
                {tasks.slice(0, 5).map(t => (
                  <li key={t.id} className="dash-task-item">
                    <label className="dash-task-row">
                      <input
                        type="checkbox"
                        checked={t.completed}
                        onChange={e => handleToggle(t.id!, t.task, e.target.checked)}
                      />
                      <span className={`dash-task-text ${t.completed ? 'completed' : ''}`}>
                        {t.task}
                      </span>
                    </label>
                    {pendingLog?.id === t.id && (
                      <div className="log-nudge">
                        <span className="log-nudge-text">log as a win?</span>
                        <button className="log-nudge-btn yes" onClick={handleLogWin}>log it</button>
                        <button className="log-nudge-btn skip" onClick={handleSkip}>skip</button>
                      </div>
                    )}
                  </li>
                ))}
                {tasks.length > 5 && (
                  <Link to="/focus" className="tasks-more">
                    +{tasks.length - 5} more →
                  </Link>
                )}
              </ul>
            )}

            {allDone && (
              <p className="tasks-done-note">that's everything.</p>
            )}
          </section>
        )}

        {/* Quick links */}
        <section className="dash-tiles">
          <Link to="/confidence" className="dash-tile">
            <span className="tile-label">achievements</span>
            <span className="tile-sub">log a win</span>
          </Link>
          <Link to="/identity" className="dash-tile">
            <span className="tile-label">identity</span>
            <span className="tile-sub">build evidence</span>
          </Link>
          <Link to="/thoughts" className="dash-tile">
            <span className="tile-label">thoughts</span>
            <span className="tile-sub">reframe</span>
          </Link>
          <Link to="/focus" className="dash-tile">
            <span className="tile-label">focus</span>
            <span className="tile-sub">set your day</span>
          </Link>
        </section>
      </div>
    </div>
  )
}

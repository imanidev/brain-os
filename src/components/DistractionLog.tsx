import { useState } from 'react'
import { useDistractions } from '../hooks/useDistractions'
import '../styles/DistractionLog.css'

export default function DistractionLog() {
  const {
    distractions,
    todayCount,
    patterns,
    loading,
    logDistraction,
    deleteDistraction,
  } = useDistractions()

  const [input, setInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLog() {
    if (!input.trim()) return
    setSaving(true)
    setError(null)

    const result = await logDistraction(input.trim())

    if (result.success) {
      setInput('')
    } else {
      setError(result.error ?? 'Could not save')
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="distraction-shell">
        <p className="distraction-loading">loading...</p>
      </div>
    )
  }

  return (
    <div className="distraction-shell">
      <div className="distraction-container">
        {/* Header */}
        <div className="distraction-header">
          <h1 className="distraction-title">Distraction Log</h1>
          <p className="distraction-sub">
            What pulled you away? Log it. See patterns.
          </p>
        </div>

        {/* Quick log */}
        <div className="distraction-card">
          <div className="log-row">
            <input
              className="log-input"
              type="text"
              placeholder="What distracted you?"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLog()}
              maxLength={200}
              disabled={saving}
            />
            <button
              className="log-btn"
              onClick={handleLog}
              disabled={!input.trim() || saving}
            >
              {saving ? '...' : 'log'}
            </button>
          </div>
          {error && <p className="error-msg">{error}</p>}
        </div>

        {/* Today's count */}
        {todayCount > 0 && (
          <div className="today-count">
            <span className="count-number">{todayCount}</span>
            <span className="count-label">distraction{todayCount !== 1 ? 's' : ''} today</span>
          </div>
        )}

        {/* Patterns */}
        {patterns.length > 0 && (
          <div className="patterns-section">
            <h2 className="section-title">Patterns</h2>
            <div className="patterns-list">
              {patterns.map(([pattern, count]) => (
                <div key={pattern} className="pattern-item">
                  <span className="pattern-text">{pattern}</span>
                  <span className="pattern-count">{count}x</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent distractions */}
        {distractions.length > 0 && (
          <div className="recent-section">
            <h2 className="section-title">Recent</h2>
            <ul className="distraction-list">
              {distractions.slice(0, 20).map(d => (
                <li key={d.id} className="distraction-item">
                  <div className="distraction-content">
                    <span className="distraction-text">{d.distraction}</span>
                    <span className="distraction-date">
                      {new Date(d.created_at!).toLocaleDateString()}
                    </span>
                  </div>
                  <button
                    className="delete-distraction-btn"
                    onClick={() => deleteDistraction(d.id!)}
                    aria-label="Delete"
                  >
                    x
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Empty state */}
        {distractions.length === 0 && (
          <div className="distraction-empty">
            <p>No distractions logged yet.</p>
            <p className="empty-sub">When something pulls you away, log it above.</p>
          </div>
        )}
      </div>
    </div>
  )
}

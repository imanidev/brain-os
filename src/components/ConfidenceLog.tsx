import { useState, useMemo } from 'react'
import { useConfidenceLogs } from '../hooks/useConfidenceLogs'
import type { ConfidenceLog as ConfidenceLogType } from '../lib/supabase'

export default function ConfidenceLog() {
  const { wins, loading, addWin, deleteWin } = useConfidenceLogs()
  const [input, setInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCelebration, setShowCelebration] = useState(false)

  function formatTimestamp(isoString: string) {
    const date = new Date(isoString)
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const year = date.getFullYear()
    return `${month}/${day}/${year}`
  }

  function formatMonthYear(isoString: string) {
    const date = new Date(isoString)
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December']
    return `${monthNames[date.getMonth()]} ${date.getFullYear()}`
  }

  // Group all wins by month
  const winsByMonth = useMemo(() => {
    const groups: { [key: string]: ConfidenceLogType[] } = {}

    wins.forEach(win => {
      if (!win.created_at) return
      const monthYear = formatMonthYear(win.created_at)
      if (!groups[monthYear]) {
        groups[monthYear] = []
      }
      groups[monthYear].push(win)
    })

    return groups
  }, [wins])

  const monthKeys = Object.keys(winsByMonth)

  async function handleAdd() {
    if (!input.trim()) return
    setSaving(true)
    setError(null)

    const result = await addWin(input.trim())

    if (result.success) {
      setInput('')
      // Show celebration
      setShowCelebration(true)
      setTimeout(() => setShowCelebration(false), 1500)
    } else {
      setError(result.error ?? 'Could not save win')
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="confidence-shell">
        <p className="confidence-loading">loading your wins…</p>
      </div>
    )
  }

  return (
    <div className="confidence-shell">
      <div className="confidence-card">

        {/* Header */}
        <div className="confidence-header">
          <h1 className="confidence-title">Achievements</h1>
          <p className="confidence-sub">
            What you've done.
          </p>
        </div>

        {/* Input */}
        <div className="section">
          <label className="section-label" htmlFor="win-input">
            Add an achievement
          </label>
          <div className="input-row">
            <input
              id="win-input"
              className="win-input"
              type="text"
              placeholder="finished the report, went to the gym, called mom..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              maxLength={200}
              disabled={saving}
            />
            <button
              className="add-btn"
              onClick={handleAdd}
              disabled={!input.trim() || saving}
            >
              {saving ? '...' : 'add'}
            </button>
          </div>
          <p className="char-count">{input.length}/200</p>
        </div>

        {/* Error */}
        {error && <p className="error-msg">{error}</p>}

        {/* Celebration */}
        {showCelebration && (
          <div className="celebration">
            <p className="celebration-text">Logged</p>
          </div>
        )}

        {/* Achievements by month */}
        <div className="wins-section">
          {wins.length === 0 ? (
            <p className="empty-state">
              Nothing yet. Add your first achievement above.
            </p>
          ) : (
            <div className="wins-container">
              {monthKeys.map(monthYear => (
                <div key={monthYear} className="month-group">
                  <h3 className="month-heading">{monthYear}</h3>
                  <ul className="wins-list">
                    {winsByMonth[monthYear].map(win => (
                      <li key={win.id} className="win-item">
                        <div className="win-content">
                          <span className="win-text">{win.win}</span>
                          {win.created_at && (
                            <span className="win-timestamp">{formatTimestamp(win.created_at)}</span>
                          )}
                        </div>
                        <button
                          className="delete-btn"
                          onClick={() => deleteWin(win.id!)}
                          aria-label="Delete win"
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

import { useState } from 'react'
import { useThoughts } from '../hooks/useThoughts'
import '../styles/ThoughtInterceptor.css'

export default function ThoughtInterceptor() {
  const {
    unreframedThoughts,
    reframedThoughts,
    loading,
    captureThought,
    reframeThought,
    deleteThought,
  } = useThoughts()

  const [input, setInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [reframingId, setReframingId] = useState<string | null>(null)
  const [reframeInput, setReframeInput] = useState('')
  const [savingReframe, setSavingReframe] = useState(false)

  async function handleCapture() {
    if (!input.trim()) return
    setSaving(true)
    setError(null)

    const result = await captureThought(input.trim())

    if (result.success) {
      setInput('')
    } else {
      setError(result.error ?? 'Could not save thought')
    }
    setSaving(false)
  }

  async function handleReframe(id: string) {
    if (!reframeInput.trim()) return
    setSavingReframe(true)

    const result = await reframeThought(id, reframeInput.trim())

    if (result.success) {
      setReframingId(null)
      setReframeInput('')
    }
    setSavingReframe(false)
  }

  function startReframing(id: string) {
    setReframingId(id)
    setReframeInput('')
  }

  function cancelReframing() {
    setReframingId(null)
    setReframeInput('')
  }

  if (loading) {
    return (
      <div className="thoughts-shell">
        <p className="thoughts-loading">loading your thoughts...</p>
      </div>
    )
  }

  return (
    <div className="thoughts-shell">
      <div className="thoughts-container">
        {/* Header */}
        <div className="thoughts-header">
          <h1 className="thoughts-title">Thought Interceptor</h1>
          <p className="thoughts-sub">
            Capture negative thoughts now. Reframe them later.
          </p>
        </div>

        {/* Quick capture */}
        <div className="thoughts-card">
          <label className="capture-label">What's the thought?</label>
          <textarea
            className="capture-input"
            placeholder="Dump it here. Don't filter."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleCapture()
              }
            }}
            maxLength={300}
            disabled={saving}
            rows={2}
          />
          <div className="capture-footer">
            <span className="char-count">{input.length}/300</span>
            <button
              className="capture-btn"
              onClick={handleCapture}
              disabled={!input.trim() || saving}
            >
              {saving ? 'capturing...' : 'capture'}
            </button>
          </div>
          {error && <p className="error-msg">{error}</p>}
        </div>

        {/* Unreframed thoughts */}
        {unreframedThoughts.length > 0 && (
          <div className="thoughts-section">
            <h2 className="section-title">
              Needs reframing ({unreframedThoughts.length})
            </h2>
            <div className="thoughts-list">
              {unreframedThoughts.map(t => (
                <div key={t.id} className="thought-item unreframed">
                  <div className="thought-content">
                    <p className="thought-text">{t.thought}</p>
                    <span className="thought-date">
                      {new Date(t.created_at!).toLocaleDateString()}
                    </span>
                  </div>

                  {reframingId === t.id ? (
                    <div className="reframe-form">
                      <textarea
                        className="reframe-input"
                        placeholder="How can you reframe this?"
                        value={reframeInput}
                        onChange={e => setReframeInput(e.target.value)}
                        maxLength={300}
                        rows={2}
                        autoFocus
                      />
                      <div className="reframe-actions">
                        <button
                          className="reframe-btn"
                          onClick={() => handleReframe(t.id!)}
                          disabled={!reframeInput.trim() || savingReframe}
                        >
                          {savingReframe ? '...' : 'save reframe'}
                        </button>
                        <button
                          className="cancel-btn"
                          onClick={cancelReframing}
                        >
                          cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="thought-actions">
                      <button
                        className="reframe-trigger"
                        onClick={() => startReframing(t.id!)}
                      >
                        reframe
                      </button>
                      <button
                        className="delete-thought-btn"
                        onClick={() => deleteThought(t.id!)}
                        aria-label="Delete thought"
                      >
                        x
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reframed thoughts */}
        {reframedThoughts.length > 0 && (
          <div className="thoughts-section">
            <h2 className="section-title">
              Reframed ({reframedThoughts.length})
            </h2>
            <div className="thoughts-list">
              {reframedThoughts.map(t => (
                <div key={t.id} className="thought-item reframed">
                  <div className="thought-pair">
                    <div className="original">
                      <span className="pair-label">Original</span>
                      <p className="thought-text struck">{t.thought}</p>
                    </div>
                    <div className="reframe">
                      <span className="pair-label">Reframe</span>
                      <p className="thought-text">{t.reframe}</p>
                    </div>
                  </div>
                  <div className="thought-meta">
                    <span className="thought-date">
                      {new Date(t.created_at!).toLocaleDateString()}
                    </span>
                    <button
                      className="delete-thought-btn"
                      onClick={() => deleteThought(t.id!)}
                      aria-label="Delete thought"
                    >
                      x
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {unreframedThoughts.length === 0 && reframedThoughts.length === 0 && (
          <div className="thoughts-empty">
            <p>No thoughts captured yet.</p>
            <p className="empty-sub">When a negative thought hits, dump it above.</p>
          </div>
        )}
      </div>
    </div>
  )
}

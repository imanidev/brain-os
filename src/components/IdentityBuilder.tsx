import { useState } from 'react'
import { useIdentity } from '../hooks/useIdentity'
import '../styles/IdentityBuilder.css'

export default function IdentityBuilder() {
  const {
    loading,
    groupedIdentities,
    identityStatements,
    addEntry,
    deleteEntry,
  } = useIdentity()

  const [evidence, setEvidence] = useState('')
  const [identity, setIdentity] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedIdentity, setExpandedIdentity] = useState<string | null>(null)

  async function handleAdd() {
    if (!evidence.trim() || !identity.trim()) return
    setSaving(true)
    setError(null)

    const result = await addEntry(evidence.trim(), identity.trim())

    if (result.success) {
      setEvidence('')
      // Keep identity for quick repeat entries
    } else {
      setError(result.error ?? 'Could not save entry')
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="identity-shell">
        <p className="identity-loading">loading your identity...</p>
      </div>
    )
  }

  return (
    <div className="identity-shell">
      <div className="identity-container">
        {/* Header */}
        <div className="identity-header">
          <h1 className="identity-title">Identity Builder</h1>
          <p className="identity-sub">
            Log evidence of who you're becoming. Actions prove identity.
          </p>
        </div>

        {/* Add entry */}
        <div className="identity-card">
          <div className="identity-form">
            <div className="form-group">
              <label className="form-label">What did you do?</label>
              <input
                className="identity-input"
                type="text"
                placeholder="I woke up at 6am..."
                value={evidence}
                onChange={e => setEvidence(e.target.value)}
                maxLength={200}
                disabled={saving}
              />
              <p className="char-count">{evidence.length}/200</p>
            </div>

            <div className="form-group">
              <label className="form-label">This proves I am someone who...</label>
              <input
                className="identity-input"
                type="text"
                placeholder="shows up early"
                value={identity}
                onChange={e => setIdentity(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                maxLength={100}
                disabled={saving}
                list="identity-suggestions"
              />
              <datalist id="identity-suggestions">
                {identityStatements.map(stmt => (
                  <option key={stmt} value={stmt} />
                ))}
              </datalist>
              <p className="char-count">{identity.length}/100</p>
            </div>

            {error && <p className="error-msg">{error}</p>}

            <button
              className="add-entry-btn"
              onClick={handleAdd}
              disabled={!evidence.trim() || !identity.trim() || saving}
            >
              {saving ? 'adding...' : 'add evidence'}
            </button>
          </div>
        </div>

        {/* Identity groups */}
        {groupedIdentities.length > 0 ? (
          <div className="identity-groups">
            {groupedIdentities.map(group => (
              <div key={group.identity} className="identity-group">
                <button
                  className="identity-group-header"
                  onClick={() =>
                    setExpandedIdentity(
                      expandedIdentity === group.identity ? null : group.identity
                    )
                  }
                >
                  <div className="identity-group-info">
                    <span className="identity-statement">
                      I am someone who {group.identity}
                    </span>
                    <span className="identity-count">
                      {group.count} {group.count === 1 ? 'proof' : 'proofs'}
                    </span>
                  </div>
                  <span className="expand-icon">
                    {expandedIdentity === group.identity ? '−' : '+'}
                  </span>
                </button>

                {expandedIdentity === group.identity && (
                  <ul className="evidence-list">
                    {group.entries.map(entry => (
                      <li key={entry.id} className="evidence-item">
                        <div className="evidence-content">
                          <span className="evidence-text">{entry.evidence}</span>
                          <span className="evidence-date">
                            {new Date(entry.created_at!).toLocaleDateString()}
                          </span>
                        </div>
                        <button
                          className="delete-entry-btn"
                          onClick={() => deleteEntry(entry.id!)}
                          aria-label="Delete entry"
                        >
                          x
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="identity-empty">
            <p>No evidence logged yet.</p>
            <p className="empty-sub">Start building proof of who you're becoming.</p>
          </div>
        )}
      </div>
    </div>
  )
}

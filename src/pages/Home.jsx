import { useState } from 'react'
import { Link } from 'react-router-dom'
import { createPaste } from '../services/api'

export default function Home() {
  const [content, setContent] = useState('')
  const [ttl, setTtl]         = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult]   = useState(null)
  const [error, setError]     = useState(null)

  const handleSubmit = async () => {
  if (!content.trim()) {
    setError('Content cannot be empty.')
    return
  }

  let ttlValue = null

  if (ttl !== '') {
    const parsed = Number(ttl)

    if (!Number.isInteger(parsed) || parsed <= 0) {
      setError('TTL must be a positive whole number.')
      return
    }

    ttlValue = parsed
  }

  setLoading(true)
  setError(null)
  setResult(null)

  try {
    const data = await createPaste({
      content,
      ttl: ttlValue
    })

    setResult(data)
    setContent('')
    setTtl('')
  } catch (err) {
    const msg =
      err.response?.data?.message ||
      err.response?.data?.error ||
      err.message ||
      'Failed to create paste.'
    setError(msg)
  } finally {
    setLoading(false)
  }
}

  const charCount = content.length

  return (
    <div className="page">
      <div className="container">
        {/* Brand */}
        <header className="brand">
          <div className="brand-dot" />
          <div className="brand-name">Paste<span>Drop</span></div>
          <div className="brand-tag">snippet sharing</div>
        </header>

        {/* Editor panel */}
        <p className="section-label">new paste</p>
        <div className="panel">
          <div className="panel-header">
            <span className="dot dot-red" />
            <span className="dot dot-yellow" />
            <span className="dot dot-green" />
          </div>

          <textarea
            className="code-area"
            rows={14}
            placeholder={`// Paste your code or text here...\n// No account needed. Just drop & share.`}
            value={content}
            onChange={(e) => {
              setContent(e.target.value)
              if (error) setError(null)
            }}
            disabled={loading}
            spellCheck={false}
            autoFocus
          />

          <div className="toolbar">
            <div className="ttl-group">
              <span className="ttl-label">expire after</span>
              <input
  className="ttl-input"
  type="number"
  min="1"
  step="1"
  inputMode="numeric"
  placeholder="∞ never"
  value={ttl}
  onChange={(e) => {
    const value = e.target.value

    // Allow empty (for never)
    if (value === '') {
      setTtl('')
      return
    }

    // Only allow positive integers
    if (/^[0-9]+$/.test(value)) {
      setTtl(value)
    }
  }}
  disabled={loading}
/>
              <span className="ttl-label">seconds</span>
            </div>

            <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--text-muted)' }}>
              {charCount > 0 ? `${charCount.toLocaleString()} chars` : ''}
            </span>

            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83">
                      <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite"/>
                    </path>
                  </svg>
                  uploading…
                </>
              ) : (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="22" y1="2" x2="11" y2="13"/>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                  create paste
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="notice notice-error" style={{ marginTop: '16px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: '1px' }}>
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}

        {/* Success */}
        {result && (
          <div className="success-card">
            <div className="success-header">
              <div className="success-icon">✓</div>
              <div className="success-title">Paste created successfully</div>
            </div>

            <div className="key-display">
              <span className="key-label">KEY</span>
              <span className="key-value">{result.keyID}</span>
            </div>

            <Link className="paste-link" to={`/paste/${result.keyID}`}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
              View paste → /paste/{result.keyID}
            </Link>
          </div>
        )}
      </div>

      <footer className="footer">
        PasteDrop · snippets expire automatically · no login needed
      </footer>
    </div>
  )
}

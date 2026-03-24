import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getPaste, deletePaste, summarizePaste } from '../services/api'

export default function ViewPaste() {
  const { keyID } = useParams()
  const navigate = useNavigate()

  const [paste, setPaste] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notFound, setNotFound] = useState(false)

  const [deleting, setDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [password, setPassword] = useState('')
  const [needsPassword, setNeedsPassword] = useState(false)
  const [wrongPassword, setWrongPassword] = useState(false)

  const [summary, setSummary] = useState(null)
  const [summarizing, setSummarizing] = useState(false)
  const [summaryError, setSummaryError] = useState(null)

  useEffect(() => {
    const fetchPaste = async () => {
      try {
        setWrongPassword(false)
        setNeedsPassword(false)
        setNotFound(false)
        setError(null)

        const data = await getPaste(keyID, password || undefined)
        setPaste(data)
      } catch (err) {
        if (err.response?.status === 404) {
          setNotFound(true)
        } else if (err.response?.status === 401) {
          setNeedsPassword(true)
        } else if (err.response?.status === 403) {
          setWrongPassword(true)
          setNeedsPassword(true)
        } else {
          setError(
            err.response?.data?.message ||
            err.response?.data?.error ||
            err.message ||
            'Failed to retrieve paste.'
          )
        }
      } finally {
        setLoading(false)
      }
    }

    fetchPaste()
  }, [keyID])

  const handleDelete = async () => {
    setDeleting(true)
    setShowConfirm(false)
    try {
      await deletePaste(keyID)
      navigate('/')
    } catch (err) {
      const msg =
        err.response?.status === 404
          ? 'Paste not found — it may have already been deleted.'
          : err.response?.data?.message || err.message || 'Failed to delete paste.'
      setError(msg)
      setDeleting(false)
    }
  }

  const handlePasswordSubmit = async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await getPaste(keyID, password)
      setPaste(data)
      setNeedsPassword(false)
      setWrongPassword(false)
    } catch (err) {
      const status = err.response?.status

      if (status === 403) {
        setWrongPassword(true)
      } else if (status === 404) {
        setPaste(null)
        setNeedsPassword(false)
        setNotFound(true)
      } else {
        setError('Failed to verify password')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSummarize = async () => {
    setSummarizing(true)
    setSummaryError(null)
    setSummary(null)

    try {
      const data = await summarizePaste(keyID, password || undefined)
      setSummary(data.summary)
    } catch (err) {
      if (err.response?.status === 401) {
        setSummaryError('Password required to summarize this paste.')
      } else if (err.response?.status === 403) {
        setSummaryError('Incorrect password.')
      } else if (err.response?.status === 404) {
        setSummaryError('Paste not found.')
      } else {
        setSummaryError('Failed to generate summary.')
      }
    } finally {
      setSummarizing(false)
    }
  }

  const handleOpenPaste = async () => {
    try {
      const data = await getPaste(keyID, password || undefined)

      setPaste(prev => ({
        ...prev,
        viewCount: data.viewCount
      }))

      window.open(data.downloadUrl, '_blank')
    } catch (err) {
      if (err.response?.status === 404) {
        setPaste(null)
        setNotFound(true)
      } else {
        setError('Failed to open paste')
      }
    }
  }

  return (
    <div className="page">
      <div className="container">

        {/* Brand */}
        <header className="brand">
          <div className="brand-dot" />
          <div className="brand-name">Paste<span>Drop</span></div>
          <div className="brand-tag">snippet sharing</div>
        </header>

        <Link to="/" className="back-link">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          new paste
        </Link>

        {/* Loading */}
        {loading && (
          <div className="spinner-wrap">
            <div className="spinner" />
            fetching paste…
          </div>
        )}

        {/* Not found */}
        {!loading && notFound && (
          <div className="not-found">
            <div className="not-found-code"><span>4</span>0<span>4</span></div>
            <p className="not-found-msg">This paste doesn't exist or has expired.</p>
            <Link to="/" className="btn btn-ghost">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              create a new paste
            </Link>
          </div>
        )}

        {/* Error (non-404) */}
        {!loading && error && (
          <div className="notice notice-error" style={{ marginBottom: '24px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: '1px' }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        {/* Password Required */}
        {!loading && needsPassword && (
          <div className="notice notice-info" style={{ marginBottom: '24px' }}>
            <div style={{ marginBottom: '12px' }}>
              This paste is password protected.
            </div>

            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handlePasswordSubmit()
              }}
              className="input"
              style={{ marginBottom: '10px', width: '100%' }}
            />

            {wrongPassword && (
              <div style={{ color: 'red', marginBottom: '8px' }}>
                Incorrect password
              </div>
            )}

            <button
              className="btn btn-primary"
              onClick={handlePasswordSubmit}
              disabled={!password.trim()}
            >
              unlock
            </button>
          </div>
        )}

        {/* Paste found */}
        {!loading && paste && (
          <>
            <div className="view-header">
              <div>
                <p className="section-label" style={{ marginBottom: '6px' }}>paste</p>
                <div className="view-title">{paste.keyID}</div>
                <div className="view-subtitle">presigned URL expires in 10 minutes</div>
                <div className="view-meta">Views: {paste.viewCount ?? 0}</div>
              </div>

              <div className="view-actions">
                <button
                  className="btn btn-primary"
                  onClick={handleOpenPaste}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                  open paste
                </button>

                {/* Summarize button */}
                <button
                  className="btn btn-primary"
                  onClick={handleSummarize}
                  disabled={summarizing}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                  {summarizing ? 'summarizing…' : 'summarize'}
                </button>

                <button
                  className="btn btn-danger"
                  onClick={() => setShowConfirm(true)}
                  disabled={deleting}
                >
                  {deleting ? (
                    <>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83">
                          <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite" />
                        </path>
                      </svg>
                      deleting…
                    </>
                  ) : (
                    <>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                      </svg>
                      delete
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Presigned URL info */}
            <div className="notice notice-info">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: '1px' }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <span>
                Click <strong style={{ color: 'var(--text)' }}>Open Paste</strong> to view or download the content via a secure S3 presigned URL.
                The link is valid for <strong style={{ color: 'var(--text)' }}>10 minutes</strong> from page load.
              </span>
            </div>

            {/* Summary Error */}
            {summaryError && (
              <div className="notice notice-error" style={{ marginTop: '16px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: '1px' }}>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {summaryError}
              </div>
            )}

            {/* Summary Result */}
            {summary && (
              <div className="notice notice-info" style={{ marginTop: '16px', flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                  <strong style={{ color: 'var(--text)', fontSize: '13px' }}>AI Summary</strong>
                </div>
                <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6', color: 'var(--text)' }}>
                  {summary}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      <footer className="footer">
        PasteDrop · snippets expire automatically · no login needed
      </footer>

      {/* Delete Confirm Overlay */}
      {showConfirm && (
        <div className="overlay" onClick={() => setShowConfirm(false)}>
          <div className="confirm-box" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-title">Delete paste?</div>
            <p className="confirm-body">
              This will permanently remove <strong style={{ color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>{keyID}</strong>.
              This action cannot be undone.
            </p>
            <div className="confirm-actions">
              <button className="btn btn-ghost" onClick={() => setShowConfirm(false)}>
                cancel
              </button>
              <button className="btn btn-danger" onClick={handleDelete}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6M14 11v6" />
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
                yes, delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
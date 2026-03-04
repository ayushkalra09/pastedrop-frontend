import { useState } from 'react'
import { Link } from 'react-router-dom'
import { createPaste, createOcrPaste } from '../services/api'

export default function Home() {
  const [content, setContent] = useState('')
  const [ttl, setTtl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [password, setPassword] = useState('')

  // =============================
  // TEXT PASTE SUBMIT
  // =============================
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
        ttl: ttlValue,
        password: password || null
      })

      setResult(data)
      setContent('')
      setTtl('')
      setPassword('')
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

  // =============================
  // OCR IMAGE UPLOAD
  // =============================
  const handleOcrUpload = async () => {
    if (!imageFile) {
      setError('Please select an image.')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const base64 = await convertToBase64(imageFile)

      const data = await createOcrPaste({
        base64Image: base64.split(',')[1],
        ttl: ttl !== '' ? Number(ttl) : null,
        password: password || null
      })

      setResult(data)
      setImageFile(null)
      setTtl('')
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'OCR failed.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  // =============================
  // BASE64 HELPER
  // =============================
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = error => reject(error)
    })
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

        {/* TEXT EDITOR PANEL */}
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

          {/* OCR SECTION */}
          <p className="section-label" style={{ marginTop: '32px' }}>
            image to text (OCR)
          </p>

          <div style={{ padding: '20px' }}>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
              disabled={loading}
            />

            <button
              type="button"
              className="btn btn-primary"
              style={{ marginTop: '12px' }}
              onClick={handleOcrUpload}
              disabled={loading}
            >
              {loading ? 'processing…' : 'extract text'}
            </button>
          </div>

          {/* TOOLBAR */}
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

                  if (value === '') {
                    setTtl('')
                    return
                  }

                  if (/^[0-9]+$/.test(value)) {
                    setTtl(value)
                  }
                }}
                disabled={loading}
              />

              <span className="ttl-label">seconds</span>
            </div>

            <input
                className='password-input'
                type="password"
                placeholder="Optional password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />

            <span
              style={{
                marginLeft: 'auto',
                fontSize: '11px',
                color: 'var(--text-muted)'
              }}
            >
              {charCount > 0 ? `${charCount.toLocaleString()} chars` : ''}
            </span>

            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'uploading…' : 'create paste'}
            </button>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="notice notice-error" style={{ marginTop: '16px' }}>
            {error}
          </div>
        )}

        {/* SUCCESS */}
        {result && (
          <div className="success-card">
            <div className="success-header">
              <div className="success-icon">✓</div>
              <div className="success-title">
                Paste created successfully
              </div>
            </div>

            <div className="key-display">
              <span className="key-label">KEY</span>
              <span className="key-value">{result.keyID}</span>
            </div>

            {(() => {
              const fullUrl = `${window.location.origin}/paste/${result.keyID}`

              return (
                <>
                  <div className="key-display">
                    <span className="key-label">LINK</span>
                    <span className="key-value">{fullUrl}</span>
                  </div>

                  <button
                    className="btn btn-primary"
                    style={{ marginTop: '12px' }}
                    onClick={() => {
                      navigator.clipboard.writeText(fullUrl)
                    }}
                  >
                    Copy link
                  </button>

                  <Link
                    className="paste-link"
                    to={`/paste/${result.keyID}`}
                  >
                    Open paste →
                  </Link>
                </>
              )
            })()}
          </div>
        )}
      </div>

      <footer className="footer">
        PasteDrop · snippets expire automatically · no login needed
      </footer>
    </div>
  )
}
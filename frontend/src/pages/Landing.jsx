import { useState } from 'react'
import axios from 'axios'
import { getApiUrl } from '../utils/api'

export default function Landing({ onStart, fadeIn = false }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleStart = async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await axios.post(getApiUrl('/api/session/create'))
      onStart(data.sessionId)
    } catch {
      setError('Could not connect to server. Make sure the backend is running on port 5000.')
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0d1f4e 0%, #1a3a8f 60%, #2a4fb8 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, opacity: fadeIn ? 1 : 0, transition: 'opacity 0.55s ease' }}>
      <div style={{ maxWidth: 560, width: '100%' }}>

        {/* Logo / Brand */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ width: 72, height: 72, background: 'rgba(255,255,255,0.1)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 36, border: '1px solid rgba(255,255,255,0.2)' }}>
            🏦
          </div>
          <h1 style={{ color: '#fff', fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em' }}>LoanWizard</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, marginTop: 6 }}>Poonawalla Fincorp · AI-Powered Loan Onboarding</p>
        </div>

        {/* Main card */}
        <div className="card" style={{ background: '#fff', padding: 36 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1a2e6b', marginBottom: 8 }}>Get your loan in minutes</h2>
          <p style={{ color: '#5a6478', fontSize: 15, marginBottom: 28, lineHeight: 1.7 }}>
            Our AI agent will guide you through a quick video interview — no paperwork, no branch visit. Just a 2-minute conversation.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 32 }}>
            {[
              ['🎥', 'Video call', 'Talk to our AI agent — answer a few questions'],
              ['🧠', 'Instant analysis', 'AI verifies your identity and assesses eligibility'],
              ['💰', 'Personalized offer', 'Get your loan offer with amount, rate & EMI instantly'],
            ].map(([icon, title, desc]) => (
              <div key={title} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <span style={{ fontSize: 22, lineHeight: 1 }}>{icon}</span>
                <div>
                  <div style={{ fontWeight: 600, color: '#1e2433', fontSize: 14 }}>{title}</div>
                  <div style={{ color: '#9aa3b2', fontSize: 13 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>

          {error && (
            <div style={{ background: '#fdeaea', color: '#c42b2b', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
              {error}
            </div>
          )}

          <button className="btn-primary" style={{ width: '100%', padding: 16, fontSize: 16 }} onClick={handleStart} disabled={loading}>
            {loading ? 'Starting session...' : 'Start Video Interview →'}
          </button>

          <p style={{ textAlign: 'center', color: '#9aa3b2', fontSize: 12, marginTop: 16 }}>
            🔒 Secured & RBI compliant · Your data is encrypted
          </p>
        </div>

        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 24 }}>
          TenzorX 2026 Hackathon Demo · Poonawalla Fincorp
        </p>
      </div>
    </div>
  )
}

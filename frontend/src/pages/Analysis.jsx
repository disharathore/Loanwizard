import { useState, useEffect } from 'react'
import axios from 'axios'

const STEPS = [
  { key: 'transcript', label: 'Extracting customer data', icon: '🧾', desc: 'Analyzing speech transcript with AI' },
  { key: 'age', label: 'Verifying identity', icon: '👤', desc: 'Estimating age from video capture' },
  { key: 'fraud', label: 'Fraud & risk check', icon: '🛡️', desc: 'Cross-checking signals for anomalies' },
  { key: 'offer', label: 'Generating loan offer', icon: '💰', desc: 'Personalizing offer based on profile' },
]

export default function Analysis({ sessionId, sessionData, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [stepStatus, setStepStatus] = useState({}) // key -> 'loading' | 'done' | 'error'
  const [results, setResults] = useState({})
  const [error, setError] = useState('')

  useEffect(() => {
    runAnalysis()
  }, [])

  const setStep = (key, status, data) => {
    setStepStatus(prev => ({ ...prev, [key]: status }))
    if (data) setResults(prev => ({ ...prev, [key]: data }))
  }

  const runAnalysis = async () => {
    const { transcript, geoLocation, capturedImage } = sessionData
    let extractedData = null, ageData = null, fraudAnalysis = null

    // Step 1: Transcript analysis
    setCurrentStep(0)
    setStep('transcript', 'loading')
    try {
      const { data } = await axios.post('/api/analyze/transcript', { sessionId, transcript, geoLocation })
      extractedData = data.extractedData
      setStep('transcript', 'done', data.extractedData)
    } catch (e) {
      setStep('transcript', 'error')
      setError('Transcript analysis failed: ' + (e.response?.data?.error || e.message))
      return
    }

    // Step 2: Age estimation
    setCurrentStep(1)
    setStep('age', 'loading')
    try {
      if (capturedImage) {
        const { data } = await axios.post('/api/analyze/age', { sessionId, imageBase64: capturedImage })
        ageData = data.ageData
        setStep('age', 'done', data.ageData)
      } else {
        // Mock age data if no image
        ageData = { estimatedAge: 28, ageRange: { min: 24, max: 32 }, confidence: 0.6, isAdult: true, flags: ['no-image-captured'], note: 'Demo mode - no image available' }
        setStep('age', 'done', ageData)
      }
    } catch (e) {
      ageData = { estimatedAge: null, confidence: 0, flags: ['estimation-failed'], isAdult: true }
      setStep('age', 'done', ageData)
    }

    // Step 3: Fraud analysis
    setCurrentStep(2)
    setStep('fraud', 'loading')
    try {
      const { data } = await axios.post('/api/analyze/fraud', {
        sessionId, extractedData, ageData, geoLocation,
        declaredAge: extractedData?.age || null
      })
      fraudAnalysis = data.fraudAnalysis
      setStep('fraud', 'done', data.fraudAnalysis)
    } catch (e) {
      setStep('fraud', 'error')
      setError('Fraud analysis failed: ' + (e.response?.data?.error || e.message))
      return
    }

    // Step 4: Offer generation
    setCurrentStep(3)
    setStep('offer', 'loading')
    try {
      const { data } = await axios.post('/api/offer/generate', { sessionId, extractedData, ageData, fraudAnalysis })
      setStep('offer', 'done', data)
      onComplete({ extractedData, ageData, fraudAnalysis, offerResult: data })
    } catch (e) {
      setStep('offer', 'error')
      setError('Offer generation failed: ' + (e.response?.data?.error || e.message))
    }
  }

  const StatusIcon = ({ status }) => {
    if (status === 'loading') return <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite', fontSize: 18 }}>⏳</span>
    if (status === 'done') return <span style={{ fontSize: 18, color: '#22c55e' }}>✅</span>
    if (status === 'error') return <span style={{ fontSize: 18, color: '#ef4444' }}>❌</span>
    return <span style={{ fontSize: 18, color: '#94a3b8' }}>○</span>
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 640, width: '100%' }}>

        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: '#1a2e6b' }}>AI Analysis in Progress</h2>
          <p style={{ color: '#64748b', marginTop: 6 }}>Our agentic AI is processing your interview data</p>
        </div>

        <div className="card" style={{ padding: 32 }}>
          {STEPS.map((step, idx) => {
            const status = stepStatus[step.key] || 'pending'
            const isActive = idx === currentStep && status === 'loading'
            return (
              <div key={step.key} style={{
                display: 'flex', alignItems: 'flex-start', gap: 16, padding: '16px 0',
                borderBottom: idx < STEPS.length - 1 ? '1px solid #f0f2f5' : 'none',
                opacity: idx > currentStep && status !== 'done' ? 0.4 : 1,
                transition: 'opacity 0.3s',
              }}>
                {/* Step icon */}
                <div style={{
                  width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                  background: status === 'done' ? '#e8f5ee' : isActive ? '#e8edf8' : '#f0f2f5',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                  border: isActive ? '2px solid #1a2e6b' : '2px solid transparent',
                  transition: 'all 0.3s',
                }}>
                  {step.icon}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 600, color: '#1e2433', fontSize: 15 }}>{step.label}</span>
                    <StatusIcon status={status} />
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: 13, marginTop: 2 }}>{step.desc}</div>

                  {/* Show extracted results inline */}
                  {status === 'done' && results[step.key] && step.key === 'transcript' && (
                    <div style={{ marginTop: 10, background: '#f8f9fb', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px', color: '#475569' }}>
                        {results[step.key].fullName && <span>👤 <b>{results[step.key].fullName}</b></span>}
                        {results[step.key].employmentType && <span>💼 {results[step.key].employmentType}</span>}
                        {results[step.key].monthlyIncome && <span>💵 ₹{results[step.key].monthlyIncome?.toLocaleString('en-IN')}/mo</span>}
                        {results[step.key].loanPurpose && <span>🎯 {results[step.key].loanPurpose}</span>}
                        {results[step.key].loanAmountRequested && <span>💰 ₹{results[step.key].loanAmountRequested?.toLocaleString('en-IN')}</span>}
                        {results[step.key].consentGiven !== undefined && <span>{results[step.key].consentGiven ? '✅ Consent given' : '❌ No consent'}</span>}
                      </div>
                    </div>
                  )}

                  {status === 'done' && results[step.key] && step.key === 'age' && (
                    <div style={{ marginTop: 8, fontSize: 12, color: '#475569' }}>
                      Estimated age: <b>{results[step.key].estimatedAge || 'N/A'}</b> yrs ·
                      Adult: <b>{results[step.key].isAdult ? 'Yes ✅' : 'No ❌'}</b> ·
                      Confidence: <b>{Math.round((results[step.key].confidence || 0) * 100)}%</b>
                      {results[step.key].flags?.length > 0 && (
                        <span style={{ color: '#f59e0b' }}> · ⚠ {results[step.key].flags.join(', ')}</span>
                      )}
                    </div>
                  )}

                  {status === 'done' && results[step.key] && step.key === 'fraud' && (
                    <div style={{ marginTop: 8, fontSize: 12 }}>
                      <span className={`badge badge-${results[step.key].overallRisk === 'low' ? 'success' : results[step.key].overallRisk === 'medium' ? 'warning' : 'danger'}`}>
                        {results[step.key].overallRisk?.toUpperCase()} RISK · Score: {results[step.key].riskScore}
                      </span>
                      {results[step.key].fraudFlags?.length > 0 && (
                        <span style={{ marginLeft: 8, color: '#94a3b8' }}>{results[step.key].fraudFlags.length} flag(s) detected</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {error && (
          <div style={{ marginTop: 16, background: '#fdeaea', border: '1px solid #fca5a5', borderRadius: 10, padding: '12px 16px', color: '#c42b2b', fontSize: 13 }}>
            ⚠️ {error}
          </div>
        )}

        {stepStatus.offer === 'done' && (
          <div style={{ textAlign: 'center', marginTop: 24, color: '#22c55e', fontWeight: 600, fontSize: 15 }}>
            ✅ Analysis complete! Loading your offer...
          </div>
        )}

        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    </div>
  )
}

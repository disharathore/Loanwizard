import { useEffect, useState } from 'react'
import Landing from './pages/Landing.jsx'
import VideoCall from './pages/VideoCall.jsx'
import Analysis from './pages/Analysis.jsx'
import Offer from './pages/Offer.jsx'

export default function App() {
  const [step, setStep] = useState('landing')
  const [sessionId, setSessionId] = useState(null)
  const [showSplash, setShowSplash] = useState(true)
  const [splashFading, setSplashFading] = useState(false)
  const [landingFadeIn, setLandingFadeIn] = useState(false)
  const [sessionData, setSessionData] = useState({
    transcript: '',
    geoLocation: null,
    capturedImage: null,
    extractedData: null,
    ageData: null,
    fraudAnalysis: null,
    offerResult: null,
  })

  useEffect(() => {
    const startFade = setTimeout(() => setSplashFading(true), 1100)
    const hideSplash = setTimeout(() => {
      setShowSplash(false)
      setLandingFadeIn(true)
    }, 1500)
    return () => {
      clearTimeout(startFade)
      clearTimeout(hideSplash)
    }
  }, [])

  const updateSession = (updates) => {
    setSessionData(prev => ({ ...prev, ...updates }))
  }

  const goTo = (s) => setStep(s)

  return (
    <div>
      {showSplash && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 2000,
          background: '#0D1F4E',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          opacity: splashFading ? 0 : 1,
          transition: 'opacity 0.4s ease'
        }}>
          <div className="lw-loader">
            <div className="lw-loader-inner" />
          </div>
          <h1 style={{ color: '#fff', fontSize: 48, fontWeight: 800, letterSpacing: '-0.03em', marginTop: 24 }}>LoanWizard</h1>
          <div style={{ color: '#e85d24', fontSize: 18, fontWeight: 600, marginTop: 4 }}>by Poonawalla Fincorp</div>
        </div>
      )}

      {/* Top progress bar */}
      {step !== 'landing' && (
        <div style={{ background: '#fff', borderBottom: '1px solid #e2e6ec', padding: '12px 24px' }}>
          <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            <img src="/logo.svg" alt="LoanWizard" style={{ height: 28 }} onError={e => e.target.style.display = 'none'} />
            <span style={{ fontWeight: 700, color: '#1a2e6b', fontSize: 16 }}>LoanWizard</span>
            <span style={{ color: '#9aa3b2', margin: '0 8px' }}>|</span>
            <span style={{ fontSize: 13, color: '#5a6478' }}>Poonawalla Fincorp Digital Onboarding</span>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
              {[['video', 'Video Call'], ['analysis', 'AI Analysis'], ['offer', 'Your Offer']].map(([s, label]) => (
                <div key={s} style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  fontSize: 12,
                  color: step === s ? '#1a2e6b' : step === 'offer' || (step === 'analysis' && s === 'video') ? '#1a7a4a' : '#9aa3b2',
                  fontWeight: step === s ? 600 : 400,
                }}>
                  <span style={{
                    width: 20, height: 20, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700,
                    background: step === s ? '#1a2e6b' : step === 'offer' || (step === 'analysis' && s === 'video') ? '#1a7a4a' : '#e2e6ec',
                    color: step === s || step === 'offer' || (step === 'analysis' && s === 'video') ? '#fff' : '#9aa3b2',
                  }}>
                    {step === 'offer' || (step === 'analysis' && s === 'video') ? '✓' : s === 'video' ? '1' : s === 'analysis' ? '2' : '3'}
                  </span>
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 'landing' && (
        <div style={{ opacity: landingFadeIn ? 1 : 0, transition: 'opacity 0.5s ease' }}>
          <Landing fadeIn={landingFadeIn} onStart={(sid) => { setSessionId(sid); goTo('video') }} />
        </div>
      )}
      {step === 'video' && (
        <VideoCall
          sessionId={sessionId}
          onComplete={(data) => { updateSession(data); goTo('analysis') }}
        />
      )}
      {step === 'analysis' && (
        <Analysis
          sessionId={sessionId}
          sessionData={sessionData}
          onComplete={(data) => { updateSession(data); goTo('offer') }}
        />
      )}
      {step === 'offer' && (
        <Offer sessionData={sessionData} sessionId={sessionId} onRestart={() => {
          setStep('landing')
          setSessionId(null)
          setSessionData({
            transcript: '',
            geoLocation: null,
            capturedImage: null,
            extractedData: null,
            ageData: null,
            fraudAnalysis: null,
            offerResult: null,
          })
        }} />
      )}

      <style>{`
        .lw-loader {
          width: 92px;
          height: 92px;
          border-radius: 50%;
          background: conic-gradient(#e85d24 0deg, #e85d24 20deg, rgba(255,255,255,0.2) 20deg, rgba(255,255,255,0.2) 360deg);
          animation: fillRing 1.5s ease forwards;
          position: relative;
        }
        .lw-loader-inner {
          position: absolute;
          inset: 10px;
          border-radius: 50%;
          background: #0D1F4E;
        }
        @keyframes fillRing {
          0% { background: conic-gradient(#e85d24 0deg, rgba(255,255,255,0.2) 0deg); }
          100% { background: conic-gradient(#e85d24 360deg, rgba(255,255,255,0.2) 360deg); }
        }
      `}</style>
    </div>
  )
}

import { useState, useRef, useEffect, useCallback } from 'react'
import axios from 'axios'
import { getApiUrl } from '../utils/api'

// AI agent questions for the interview
const INTERVIEW_QUESTIONS = [
  "Hello! I'm your LoanWizard AI agent from Poonawalla Fincorp. I'll guide you through a quick loan application. Could you please start by telling me your full name?",
  "Thank you! What is your current employment status — are you salaried, self-employed, or a student?",
  "Great. What is your approximate monthly income in rupees?",
  "What is the purpose of this loan? For example — education, home renovation, medical expenses, or business.",
  "How much loan amount are you looking for, roughly?",
  "Do you currently have any existing loans or EMIs?",
  "Finally, do you consent to Poonawalla Fincorp processing your information for this loan application? Please say 'I consent' or 'Yes, I agree'.",
  "Wonderful! I have everything I need. Let me analyze your responses now.",
]

export default function VideoCall({ sessionId, onComplete }) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const recognitionRef = useRef(null)
  const canvasRef = useRef(null)

  const [phase, setPhase] = useState('setup') // setup | interview | processing | done
  const [questionIdx, setQuestionIdx] = useState(0)
  const [transcript, setTranscript] = useState([])
  const [currentListening, setCurrentListening] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [geoLocation, setGeoLocation] = useState(null)
  const [geoStatus, setGeoStatus] = useState('pending')
  const [capturedImage, setCapturedImage] = useState(null)
  const [error, setError] = useState('')
  const [cameraReady, setCameraReady] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => setCameraReady(true)
      }
    } catch (err) {
      setError('Camera/microphone access denied. Please allow access and refresh.')
    }
  }

  // Get geo-location
  const captureGeo = () => {
    if (!navigator.geolocation) {
      setGeoStatus('unavailable')
      return
    }
    setGeoStatus('capturing')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const geo = { latitude: pos.coords.latitude, longitude: pos.coords.longitude, accuracy: pos.coords.accuracy }
        setGeoLocation(geo)
        setGeoStatus('captured')
        axios.post(getApiUrl(`/api/session/${sessionId}/geo`), geo).catch(() => {})
      },
      () => setGeoStatus('denied')
    )
  }

  // Capture screenshot from video
  const captureScreenshot = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return null
    const canvas = canvasRef.current
    canvas.width = videoRef.current.videoWidth || 640
    canvas.height = videoRef.current.videoHeight || 480
    const ctx = canvas.getContext('2d')
    ctx.drawImage(videoRef.current, 0, 0)
    return canvas.toDataURL('image/jpeg', 0.8)
  }, [])

  // Text-to-speech for AI questions
  const speak = useCallback((text) => {
    return new Promise((resolve) => {
      if (!window.speechSynthesis) { resolve(); return }
      window.speechSynthesis.cancel()
      const utt = new SpeechSynthesisUtterance(text)
      utt.rate = 0.9
      utt.pitch = 1.0
      utt.volume = 1
      const voices = window.speechSynthesis.getVoices()
      const preferred = voices.find(v => v.name.includes('Google') || v.name.includes('Female') || v.lang === 'en-IN')
      if (preferred) utt.voice = preferred
      setIsSpeaking(true)
      utt.onend = () => { setIsSpeaking(false); resolve() }
      utt.onerror = () => { setIsSpeaking(false); resolve() }
      window.speechSynthesis.speak(utt)
    })
  }, [])

  // Speech recognition for user responses
  const listenForResponse = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      return Promise.resolve('[Speech recognition not supported — please type your answer below]')
    }

    return new Promise((resolve) => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      recognitionRef.current = recognition
      recognition.continuous = false
      recognition.interimResults = true
      recognition.lang = 'en-IN'
      recognition.maxAlternatives = 1

      let finalTranscript = ''
      let silenceTimer = null

      recognition.onstart = () => setIsListening(true)

      recognition.onresult = (event) => {
        let interim = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const t = event.results[i][0].transcript
          if (event.results[i].isFinal) finalTranscript += t + ' '
          else interim = t
        }
        setCurrentListening(finalTranscript + interim)

        if (silenceTimer) clearTimeout(silenceTimer)
        silenceTimer = setTimeout(() => {
          recognition.stop()
        }, 3000)
      }

      recognition.onend = () => {
        setIsListening(false)
        setCurrentListening('')
        resolve(finalTranscript.trim() || '[No response captured]')
      }

      recognition.onerror = () => {
        setIsListening(false)
        setCurrentListening('')
        resolve('[Error capturing audio]')
      }

      recognition.start()
    })
  }, [])

  // Run the full interview flow
  const runInterview = useCallback(async () => {
    setPhase('interview')
    setElapsedSeconds(0)
    const fullTranscript = []
    const img = captureScreenshot()
    if (img) setCapturedImage(img)

    for (let i = 0; i < INTERVIEW_QUESTIONS.length; i++) {
      setQuestionIdx(i)
      const question = INTERVIEW_QUESTIONS[i]
      fullTranscript.push({ role: 'agent', text: question })

      await speak(question)

      if (i < INTERVIEW_QUESTIONS.length - 1) {
        const response = await listenForResponse()
        fullTranscript.push({ role: 'customer', text: response })
        setTranscript([...fullTranscript])
      }
    }

    setPhase('processing')
    const transcriptText = fullTranscript
      .map(t => `${t.role === 'agent' ? 'Agent' : 'Customer'}: ${t.text}`)
      .join('\n')

    // Stop camera
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
    }

    await new Promise(resolve => setTimeout(resolve, 1500))
    setPhase('done')
    onComplete({ transcript: transcriptText, geoLocation, capturedImage: img })
  }, [speak, listenForResponse, captureScreenshot, geoLocation, onComplete])

  useEffect(() => {
    if (phase !== 'interview') return
    const interval = setInterval(() => {
      setElapsedSeconds(prev => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [phase])

  useEffect(() => {
    startCamera()
    captureGeo()
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
      window.speechSynthesis?.cancel()
    }
  }, [])

  const geoIcon = { pending: '📍', capturing: '⏳', captured: '✅', denied: '⚠️', unavailable: '❌' }
  const geoLabel = { pending: 'Waiting...', capturing: 'Locating...', captured: 'Captured', denied: 'Location denied', unavailable: 'Unavailable' }
  const timerText = `${String(Math.floor(elapsedSeconds / 60)).padStart(2, '0')}:${String(elapsedSeconds % 60).padStart(2, '0')}`

  return (
    <div style={{ minHeight: '100vh', background: '#0d1420', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 780 }}>

        {/* Status bar */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 8, padding: '6px 14px', fontSize: 12, color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: cameraReady ? '#22c55e' : '#f59e0b', display: 'inline-block' }}></span>
            {cameraReady ? 'Camera ready' : 'Starting camera...'}
          </div>
          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 8, padding: '6px 14px', fontSize: 12, color: '#fff' }}>
            {geoIcon[geoStatus]} Location: {geoLabel[geoStatus]}
          </div>
          {isListening && (
            <div style={{ background: 'rgba(34,197,94,0.2)', border: '1px solid #22c55e', borderRadius: 8, padding: '6px 14px', fontSize: 12, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ animation: 'pulse 1s infinite' }}>🎙</span> Listening...
            </div>
          )}
          {isSpeaking && (
            <div style={{ background: 'rgba(59,130,246,0.2)', border: '1px solid #3b82f6', borderRadius: 8, padding: '6px 14px', fontSize: 12, color: '#93c5fd' }}>
              🔊 Agent speaking...
            </div>
          )}
          {phase === 'interview' && (
            <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 8, padding: '6px 14px', fontSize: 12, color: '#fff' }}>
              ⏱ Interview time: {timerText}
            </div>
          )}
        </div>

        {/* Main layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16 }}>

          {/* Video */}
          <div style={{ position: 'relative', background: '#1a2235', borderRadius: 16, overflow: 'hidden', aspectRatio: '4/3' }}>
            {isListening && (
              <div style={{ position: 'absolute', inset: 6, borderRadius: 14, border: '3px solid rgba(34,197,94,0.95)', animation: 'voiceRing 1s ease-out infinite', zIndex: 4, pointerEvents: 'none' }} />
            )}
            {isSpeaking && (
              <div style={{ position: 'absolute', inset: 16, borderRadius: 12, border: '3px solid rgba(59,130,246,0.95)', animation: 'agentRing 1.1s ease-out infinite', zIndex: 4, pointerEvents: 'none' }} />
            )}
            <video ref={videoRef} autoPlay muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {/* Overlay: current listening text */}
            {currentListening && (
              <div style={{ position: 'absolute', bottom: 16, left: 16, right: 16, background: 'rgba(0,0,0,0.7)', borderRadius: 10, padding: '10px 14px', color: '#fff', fontSize: 13 }}>
                {currentListening}
              </div>
            )}

            {/* Overlay: progress */}
            {phase === 'interview' && (
              <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(26,46,107,0.9)', borderRadius: 8, padding: '4px 12px', fontSize: 12, color: '#fff' }}>
                {questionIdx + 1} / {INTERVIEW_QUESTIONS.length}
              </div>
            )}

            {/* Agent avatar overlay */}
            <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#1a2e6b', border: '2px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🤖</div>
              <span style={{ color: '#fff', fontSize: 12, fontWeight: 600, textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>LoanWizard Agent</span>
            </div>

            {(phase === 'processing' || phase === 'done') && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,15,28,0.72)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 6 }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', border: '4px solid rgba(255,255,255,0.25)', borderTopColor: '#e85d24', animation: 'spin 1s linear infinite' }} />
                <div style={{ marginTop: 12, color: '#fff', fontWeight: 700, fontSize: 15 }}>Processing your interview...</div>
                <div style={{ marginTop: 4, color: '#9fb3d9', fontSize: 12 }}>Preparing AI analysis</div>
              </div>
            )}
          </div>

          {/* Chat panel */}
          <div style={{ background: '#1a2235', borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', maxHeight: 420, overflow: 'hidden' }}>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Transcript</div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {transcript.length === 0 && phase === 'setup' && (
                <div style={{ color: '#475569', fontSize: 13, textAlign: 'center', marginTop: 40 }}>
                  Start the interview to see transcript
                </div>
              )}
              {transcript.map((t, i) => (
                <div key={i} style={{
                  padding: '8px 12px', borderRadius: 10, fontSize: 12, lineHeight: 1.5,
                  background: t.role === 'agent' ? 'rgba(26,46,107,0.6)' : 'rgba(255,255,255,0.06)',
                  color: t.role === 'agent' ? '#93c5fd' : '#e2e8f0',
                  alignSelf: t.role === 'agent' ? 'flex-start' : 'flex-end',
                  maxWidth: '90%',
                }}>
                  <span style={{ fontSize: 10, opacity: 0.6, display: 'block', marginBottom: 2 }}>
                    {t.role === 'agent' ? '🤖 Agent' : '👤 You'}
                  </span>
                  {t.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action area */}
        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center', gap: 12 }}>
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', borderRadius: 10, padding: '10px 16px', color: '#fca5a5', fontSize: 13 }}>
              {error}
            </div>
          )}

          {phase === 'setup' && !error && (
            <button
              className="btn-accent"
              style={{ padding: '14px 40px', fontSize: 16, borderRadius: 12 }}
              onClick={runInterview}
              disabled={!cameraReady}
            >
              {cameraReady ? '🎙 Start Interview' : 'Waiting for camera...'}
            </button>
          )}

          {phase === 'interview' && (
            <div style={{ color: '#64748b', fontSize: 13 }}>Interview in progress — please speak your answers clearly</div>
          )}

          {phase === 'processing' && (
            <div style={{ color: '#93c5fd', fontSize: 13 }}>Processing your interview...</div>
          )}

          {phase === 'done' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{ color: '#22c55e', fontSize: 15, fontWeight: 600 }}>✅ Interview complete! Proceeding to AI analysis...</div>
            </div>
          )}
        </div>

        {/* Manual override for demo */}
        {phase === 'setup' && (
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <button
              style={{ background: 'none', border: 'none', color: '#475569', fontSize: 12, textDecoration: 'underline', cursor: 'pointer' }}
              onClick={() => {
                const demo = `Agent: Hello! I'm your LoanWizard AI agent.
Customer: Hi, my name is Rahul Sharma.
Agent: What is your employment status?
Customer: I am salaried. I work at Infosys as a software engineer.
Agent: What is your monthly income?
Customer: My monthly income is around 85,000 rupees.
Agent: What is the purpose of this loan?
Customer: I want to take a loan for home renovation.
Agent: How much loan are you looking for?
Customer: Around 5 to 6 lakhs.
Agent: Do you have existing loans?
Customer: Yes, I have a small car loan with 8,000 rupees EMI remaining.
Agent: Do you consent to processing your data?
Customer: Yes, I consent. I agree to the terms.`
                onComplete({ transcript: demo, geoLocation, capturedImage: null })
              }}
            >
              ⚡ Quick Demo (pre-filled answers)
            </button>
          </div>
        )}

        <style>{`
          @keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes voiceRing {
            0% { transform: scale(0.99); box-shadow: 0 0 0 0 rgba(34,197,94,0.35); }
            70% { transform: scale(1.01); box-shadow: 0 0 0 16px rgba(34,197,94,0); }
            100% { transform: scale(0.99); box-shadow: 0 0 0 0 rgba(34,197,94,0); }
          }
          @keyframes agentRing {
            0% { transform: scale(0.99); box-shadow: 0 0 0 0 rgba(59,130,246,0.3); }
            70% { transform: scale(1.01); box-shadow: 0 0 0 14px rgba(59,130,246,0); }
            100% { transform: scale(0.99); box-shadow: 0 0 0 0 rgba(59,130,246,0); }
          }
        `}</style>
      </div>
    </div>
  )
}

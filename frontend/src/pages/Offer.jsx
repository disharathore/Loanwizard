import { useMemo, useState } from 'react'

const fmt = (n) => n ? `₹${Number(n).toLocaleString('en-IN')}` : 'N/A'

export default function Offer({ sessionData, sessionId, onRestart }) {
  const { offerResult, extractedData, ageData, fraudAnalysis } = sessionData
  const [selectedOffer, setSelectedOffer] = useState(1)
  const [showAudit, setShowAudit] = useState(false)
  const [copied, setCopied] = useState(false)

  if (!offerResult) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#64748b' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>⏳</div>
          <p>Loading your offer...</p>
        </div>
      </div>
    )
  }

  const { offer, status, auditLog } = offerResult
  const isEligible = offer?.eligible && status === 'approved'
  const offers = offer?.offers || []
  const selected = offers[selectedOffer] || offers[0]
  const activeSessionId = sessionId || auditLog?.sessionId || 'N/A'
  const validityDate = useMemo(() => {
    const days = Number(offer?.validityDays || 7)
    const dt = new Date()
    dt.setDate(dt.getDate() + days)
    return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  }, [offer?.validityDays])

  const riskColor = fraudAnalysis?.overallRisk === 'low' ? 'success' : fraudAnalysis?.overallRisk === 'medium' ? 'warning' : 'danger'

  const downloadOfferLetter = () => {
    if (!selected) return
    const customerName = extractedData?.fullName || 'Customer'
    const html = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Loan Offer Letter</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 28px; color: #1e2433; }
            h1 { color: #1a2e6b; margin: 0 0 6px; }
            h2 { color: #e85d24; margin: 0 0 20px; font-size: 16px; }
            .card { border: 1px solid #d7dce6; border-radius: 10px; padding: 16px; margin-bottom: 14px; }
            .row { display: flex; justify-content: space-between; border-bottom: 1px dashed #e3e7ef; padding: 8px 0; }
            .row:last-child { border-bottom: none; }
            .muted { color: #64748b; }
          </style>
        </head>
        <body>
          <h1>LoanWizard Offer Letter</h1>
          <h2>by Poonawalla Fincorp</h2>
          <div class="card">
            <div class="row"><span>Offer ID</span><strong>${activeSessionId}</strong></div>
            <div class="row"><span>Customer Name</span><strong>${customerName}</strong></div>
            <div class="row"><span>Loan Amount</span><strong>${fmt(selected.loanAmount)}</strong></div>
            <div class="row"><span>Interest Rate</span><strong>${selected.interestRate}% p.a.</strong></div>
            <div class="row"><span>EMI Per Month</span><strong>${fmt(selected.emiPerMonth)}</strong></div>
            <div class="row"><span>Tenure</span><strong>${selected.tenure} months</strong></div>
            <div class="row"><span>Validity Date</span><strong>${validityDate}</strong></div>
          </div>
          <p class="muted">This is a system-generated pre-approval summary for demo/evaluation purposes.</p>
        </body>
      </html>
    `
    const printWindow = window.open('', '_blank', 'width=900,height=700')
    if (!printWindow) return
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }

  const shareViaWhatsApp = () => {
    if (!selected) return
    const message = `I got pre-approved for ${fmt(selected.loanAmount)} loan at ${selected.interestRate}% from Poonawalla Fincorp via LoanWizard!`
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
  }

  const copyOfferId = async () => {
    try {
      await navigator.clipboard.writeText(String(activeSessionId))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fb', padding: '32px 16px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 52, marginBottom: 8 }}>{isEligible ? '🎉' : '😔'}</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1a2e6b', marginBottom: 8 }}>
            {isEligible ? 'Congratulations! Your offer is ready' : 'Application Under Review'}
          </h1>
          <p style={{ color: '#64748b' }}>
            {isEligible
              ? `Hi ${extractedData?.fullName || 'there'}, you're pre-approved for a personal loan from Poonawalla Fincorp.`
              : 'Your application needs additional verification by our team.'}
          </p>
        </div>

        {/* Customer summary card */}
        <div className="card" style={{ marginBottom: 20, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Customer Profile</div>
            <div style={{ fontWeight: 700, fontSize: 18, color: '#1a2e6b', marginBottom: 4 }}>{extractedData?.fullName || 'Customer'}</div>
            <div style={{ fontSize: 13, color: '#64748b' }}>
              {extractedData?.employmentType} · {extractedData?.employerName || extractedData?.city || '—'}
            </div>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
              Income: {fmt(extractedData?.monthlyIncome)}/mo · Age: {ageData?.estimatedAge || '—'} yrs
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>CREDIT BAND</div>
              <div style={{ fontWeight: 800, fontSize: 28, color: '#1a2e6b' }}>{offer?.creditBand || 'B+'}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>RISK</div>
              <span className={`badge badge-${riskColor}`} style={{ fontSize: 13 }}>
                {fraudAnalysis?.overallRisk?.toUpperCase() || '—'}
              </span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>CONSENT</div>
              <div style={{ fontWeight: 700, color: extractedData?.consentGiven ? '#1a7a4a' : '#c42b2b', fontSize: 14 }}>
                {extractedData?.consentGiven ? '✅ Given' : '❌ Not given'}
              </div>
            </div>
          </div>
        </div>

        {isEligible && offers.length > 0 ? (
          <>
            {/* Offer selector tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              {offers.map((o, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedOffer(idx)}
                  style={{
                    flex: 1, minWidth: 100, padding: '10px 16px', borderRadius: 10, border: 'none',
                    background: selectedOffer === idx ? '#1a2e6b' : '#fff',
                    color: selectedOffer === idx ? '#fff' : '#5a6478',
                    fontWeight: 600, fontSize: 14,
                    boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                >
                  {o.type}
                  {idx === 1 && <span style={{ marginLeft: 6, fontSize: 10, background: '#e85d24', color: '#fff', padding: '1px 6px', borderRadius: 6 }}>Best</span>}
                </button>
              ))}
            </div>

            {/* Main offer card */}
            {selected && (
              <>
                <div className="card" style={{ background: '#1a2e6b', color: '#fff', marginBottom: 12, padding: 32 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 24 }}>
                    {[
                      ['Loan Amount', fmt(selected.loanAmount)],
                      ['Interest Rate', `${selected.interestRate}% p.a.`],
                      ['Tenure', `${selected.tenure} months`],
                      ['EMI / Month', fmt(selected.emiPerMonth)],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{label}</div>
                        <div style={{ fontSize: 22, fontWeight: 800 }}>{value}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.15)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
                      Processing fee: {fmt(selected.processingFee)} · Total cost: {fmt(selected.totalCost)}
                    </div>
                    <div style={{ fontSize: 13, color: '#86efac' }}>✨ {selected.highlight}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                  <button onClick={downloadOfferLetter} style={{ padding: '8px 12px', fontSize: 12, borderRadius: 8, background: '#1a2e6b', color: '#fff', border: '1px solid #2a47a8' }}>
                    Download Offer Letter
                  </button>
                  <button onClick={shareViaWhatsApp} style={{ padding: '8px 12px', fontSize: 12, borderRadius: 8, background: '#e85d24', color: '#fff', border: '1px solid #f07240' }}>
                    Share via WhatsApp
                  </button>
                  <button onClick={copyOfferId} style={{ padding: '8px 12px', fontSize: 12, borderRadius: 8, background: '#fff', color: '#1a2e6b', border: '1px solid #1a2e6b' }}>
                    Copy Offer ID
                  </button>
                </div>

                {copied && (
                  <div style={{ marginBottom: 18, background: '#e8f5ee', border: '1px solid #b8e4cb', color: '#1a7a4a', padding: '8px 12px', borderRadius: 8, fontSize: 12, width: 'fit-content' }}>
                    Copied!
                  </div>
                )}
              </>
            )}

            {/* Next steps */}
            {offer?.nextSteps?.length > 0 && (
              <div className="card" style={{ marginBottom: 20 }}>
                <div style={{ fontWeight: 700, color: '#1a2e6b', marginBottom: 14 }}>Next Steps</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {offer.nextSteps.map((step, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#e8edf8', color: '#1a2e6b', fontWeight: 700, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {i + 1}
                      </div>
                      <div style={{ fontSize: 14, color: '#475569', paddingTop: 2 }}>{step}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Personalized message */}
            {offer?.personalizedMessage && (
              <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 12, padding: '14px 18px', marginBottom: 20, fontSize: 14, color: '#92400e', fontStyle: 'italic' }}>
                💬 {offer.personalizedMessage}
              </div>
            )}

            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <button className="btn-primary" style={{ padding: '14px 48px', fontSize: 16 }}>
                Accept Offer & Apply Now
              </button>
              <div style={{ marginTop: 10, fontSize: 12, color: '#94a3b8' }}>
                Offer valid for {offer?.validityDays || 7} days · Subject to final verification
              </div>
            </div>
          </>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: 40, marginBottom: 20 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
            <div style={{ fontWeight: 600, color: '#1e2433', marginBottom: 8 }}>Manual Review Required</div>
            <div style={{ color: '#64748b', fontSize: 14 }}>
              Our team will review your application within 24-48 hours and contact you with a decision.
            </div>
          </div>
        )}

        {/* Fraud flags summary */}
        {fraudAnalysis?.fraudFlags?.length > 0 && (
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ fontWeight: 700, color: '#1a2e6b', marginBottom: 12 }}>🛡️ Risk Signal Summary</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {fraudAnalysis.fraudFlags.map((flag, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 12px', background: flag.severity === 'high' ? '#fdeaea' : flag.severity === 'medium' ? '#fef3d0' : '#f0f2f5', borderRadius: 8 }}>
                  <span className={`badge badge-${flag.severity === 'high' ? 'danger' : flag.severity === 'medium' ? 'warning' : 'info'}`} style={{ flexShrink: 0, fontSize: 11 }}>
                    {flag.severity}
                  </span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{flag.flag}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{flag.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Audit log toggle */}
        <div className="card" style={{ marginBottom: 20 }}>
          <button
            style={{ background: 'none', border: 'none', padding: 0, width: '100%', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
            onClick={() => setShowAudit(!showAudit)}
          >
            <span style={{ fontWeight: 700, color: '#1a2e6b' }}>📁 Audit Log & Compliance Record</span>
            <span style={{ color: '#94a3b8', fontSize: 13 }}>{showAudit ? '▲ Hide' : '▼ Show'}</span>
          </button>
          {showAudit && auditLog && (
            <div style={{ marginTop: 16, background: '#0d1420', borderRadius: 10, padding: 16, overflow: 'auto', maxHeight: 300 }}>
              <pre style={{ color: '#86efac', fontSize: 11, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'monospace' }}>
                {JSON.stringify(auditLog, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Restart */}
        <div style={{ textAlign: 'center' }}>
          <button className="btn-ghost" onClick={onRestart}>← Start New Application</button>
        </div>

      </div>
    </div>
  )
}

const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.title = "LoanWizard – TenzorX 2026";
pres.author = "TenzorX Hackathon Team";

// ── Color Palette (Midnight Executive + Orange Accent) ──
const C = {
  navy:    "0D1F4E",
  navyMid: "1A2E6B",
  navyLt:  "2A47A8",
  orange:  "E85D24",
  orangeLt:"F07240",
  white:   "FFFFFF",
  offWhite:"F8F9FB",
  slate:   "5A6478",
  slateL:  "94A3B8",
  green:   "1A7A4A",
  greenLt: "E8F5EE",
  amber:   "C47A00",
  amberLt: "FEF3D0",
  red:     "C42B2B",
  redLt:   "FDEAEA",
};

const shadow = () => ({ type: "outer", blur: 8, offset: 3, angle: 135, color: "000000", opacity: 0.12 });

// ════════════════════════════════════════════
// SLIDE 1 — Title / Hero
// ════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.navy };

  // Left accent bar
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.18, h: 5.625, fill: { color: C.orange }, line: { width: 0 } });

  // Tagline pill
  s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 0.6, w: 3.4, h: 0.38, fill: { color: C.orange, transparency: 80 }, line: { width: 0 } });
  s.addText("TenzorX 2026 · Problem Statement 3", { x: 0.5, y: 0.6, w: 3.4, h: 0.38, fontSize: 10, color: C.orange, bold: true, align: "center", margin: 0 });

  // Main title
  s.addText("LoanWizard", { x: 0.5, y: 1.2, w: 6.5, h: 1.2, fontSize: 64, color: C.white, bold: true, fontFace: "Calibri" });

  // Subtitle
  s.addText("Agentic AI Video Call–Based Loan Onboarding", {
    x: 0.5, y: 2.4, w: 6.5, h: 0.6, fontSize: 22, color: "CADCFC", fontFace: "Calibri"
  });

  // Description
  s.addText("A fully digital, AI-driven loan origination system that replaces paperwork\nwith a 2-minute video conversation — real-time KYC, fraud detection & personalized offers.", {
    x: 0.5, y: 3.1, w: 6.2, h: 1.0, fontSize: 13, color: C.slateL, fontFace: "Calibri", lineSpacingMultiple: 1.4
  });

  // Brand pill bottom
  s.addText("Poonawalla Fincorp  ·  Powered by Claude AI", {
    x: 0.5, y: 4.9, w: 4, h: 0.4, fontSize: 11, color: C.slateL
  });

  // Right side: big emoji-style icon panel
  s.addShape(pres.shapes.RECTANGLE, { x: 7.2, y: 0.5, w: 2.5, h: 4.5, fill: { color: C.navyMid }, line: { width: 0 }, shadow: shadow() });
  s.addText("🏦", { x: 7.2, y: 1.4, w: 2.5, h: 1.2, fontSize: 60, align: "center" });
  s.addText("Video · AI · Instant", { x: 7.2, y: 3.0, w: 2.5, h: 0.5, fontSize: 12, color: C.slateL, align: "center" });
  s.addText("Loan Offer", { x: 7.2, y: 3.5, w: 2.5, h: 0.5, fontSize: 18, color: C.orange, bold: true, align: "center" });
}

// ════════════════════════════════════════════
// SLIDE 2 — Problem Statement
// ════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.offWhite };

  s.addText("The Problem", { x: 0.5, y: 0.35, w: 9, h: 0.55, fontSize: 30, color: C.navyMid, bold: true });
  s.addText("Traditional loan journeys are broken", { x: 0.5, y: 0.9, w: 9, h: 0.35, fontSize: 15, color: C.slate });

  const problems = [
    ["📋", "High Drop-offs", "Complex forms cause 60–70%\nof applicants to abandon"],
    ["🎭", "Identity Fraud", "No real-time verification\nleads to misrepresentation"],
    ["⏳", "Slow KYC", "Manual processes add\n3–5 days to approval time"],
    ["🗂️", "Incomplete Data", "Form-based apps miss\ncritical customer context"],
  ];

  problems.forEach(([icon, title, desc], i) => {
    const x = 0.4 + i * 2.35;
    s.addShape(pres.shapes.RECTANGLE, { x, y: 1.5, w: 2.1, h: 3.3, fill: { color: C.white }, line: { width: 0 }, shadow: shadow() });
    // Red top accent
    s.addShape(pres.shapes.RECTANGLE, { x, y: 1.5, w: 2.1, h: 0.08, fill: { color: C.red }, line: { width: 0 } });
    s.addText(icon, { x, y: 1.65, w: 2.1, h: 0.8, fontSize: 36, align: "center" });
    s.addText(title, { x, y: 2.5, w: 2.1, h: 0.45, fontSize: 13, bold: true, color: C.navyMid, align: "center" });
    s.addText(desc, { x, y: 2.95, w: 2.1, h: 0.8, fontSize: 11, color: C.slate, align: "center", lineSpacingMultiple: 1.35 });
  });

  // Bottom stat bar
  s.addShape(pres.shapes.RECTANGLE, { x: 0.4, y: 5.0, w: 9.2, h: 0.45, fill: { color: C.navyMid }, line: { width: 0 } });
  s.addText("India's NBFC sector processes 50M+ loan applications/year — yet 72% still involve manual touchpoints (RBI 2025)", {
    x: 0.4, y: 5.0, w: 9.2, h: 0.45, fontSize: 11, color: C.white, align: "center", margin: 0
  });
}

// ════════════════════════════════════════════
// SLIDE 3 — Solution Overview
// ════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.navy };

  s.addText("Our Solution", { x: 0.5, y: 0.35, w: 9, h: 0.55, fontSize: 30, color: C.white, bold: true });
  s.addText("End-to-end agentic AI loan origination via live video call", { x: 0.5, y: 0.9, w: 9, h: 0.35, fontSize: 15, color: C.slateL });

  const steps = [
    ["1", "Secure Link", "Customer clicks\nSMS / WhatsApp link"],
    ["2", "Video Call", "AI agent conducts\nstructured interview"],
    ["3", "Speech-to-Text", "Extracts income,\nconsent, employment"],
    ["4", "Vision AI", "Age estimation\nfrom live video"],
    ["5", "Risk Engine", "Fraud detection +\npolicy rules + ML"],
    ["6", "Instant Offer", "Personalized loan\noffer generated"],
  ];

  steps.forEach(([num, title, desc], i) => {
    const row = Math.floor(i / 3);
    const col = i % 3;
    const x = 0.5 + col * 3.1;
    const y = 1.55 + row * 1.85;

    s.addShape(pres.shapes.RECTANGLE, { x, y, w: 2.8, h: 1.6, fill: { color: C.navyMid }, line: { width: 0 } });
    // Number circle
    s.addShape(pres.shapes.OVAL, { x: x + 0.15, y: y + 0.15, w: 0.45, h: 0.45, fill: { color: C.orange }, line: { width: 0 } });
    s.addText(num, { x: x + 0.15, y: y + 0.15, w: 0.45, h: 0.45, fontSize: 13, bold: true, color: C.white, align: "center", margin: 0 });
    s.addText(title, { x: x + 0.7, y: y + 0.18, w: 2.0, h: 0.38, fontSize: 13, bold: true, color: C.white });
    s.addText(desc, { x: x + 0.15, y: y + 0.65, w: 2.5, h: 0.75, fontSize: 11, color: C.slateL, lineSpacingMultiple: 1.3 });

    // Arrow connector (between cols)
    if (col < 2) {
      s.addShape(pres.shapes.LINE, { x: x + 2.8, y: y + 0.77, w: 0.3, h: 0, line: { color: C.orange, width: 1.5, dashType: "dash" } });
    }
  });
}

// ════════════════════════════════════════════
// SLIDE 4 — Technical Architecture
// ════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.offWhite };

  s.addText("Technical Architecture", { x: 0.5, y: 0.35, w: 9, h: 0.55, fontSize: 30, color: C.navyMid, bold: true });

  // Frontend block
  s.addShape(pres.shapes.RECTANGLE, { x: 0.4, y: 1.1, w: 2.8, h: 3.8, fill: { color: C.white }, line: { width: 0 }, shadow: shadow() });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.4, y: 1.1, w: 2.8, h: 0.45, fill: { color: C.navyMid }, line: { width: 0 } });
  s.addText("Frontend — React", { x: 0.4, y: 1.1, w: 2.8, h: 0.45, fontSize: 12, bold: true, color: C.white, align: "center", margin: 0 });
  const feItems = ["🎥 Live video stream", "🎙 Web Speech API (STT)", "📍 Geo-location capture", "📸 Webcam screenshot", "💬 Real-time transcript UI", "📊 Offer display + audit log"];
  feItems.forEach((item, i) => {
    s.addText(item, { x: 0.55, y: 1.65 + i * 0.35, w: 2.5, h: 0.32, fontSize: 11, color: C.slate });
  });

  // Arrow
  s.addShape(pres.shapes.LINE, { x: 3.2, y: 3.0, w: 0.5, h: 0, line: { color: C.orange, width: 2 } });

  // Backend block
  s.addShape(pres.shapes.RECTANGLE, { x: 3.7, y: 1.1, w: 2.9, h: 3.8, fill: { color: C.white }, line: { width: 0 }, shadow: shadow() });
  s.addShape(pres.shapes.RECTANGLE, { x: 3.7, y: 1.1, w: 2.9, h: 0.45, fill: { color: C.navyLt }, line: { width: 0 } });
  s.addText("Backend — Node.js / Express", { x: 3.7, y: 1.1, w: 2.9, h: 0.45, fontSize: 12, bold: true, color: C.white, align: "center", margin: 0 });
  const beItems = ["🔑 Session management", "📝 /api/analyze/transcript", "👤 /api/analyze/age", "🛡 /api/analyze/fraud", "💰 /api/offer/generate", "📁 Audit log storage"];
  beItems.forEach((item, i) => {
    s.addText(item, { x: 3.85, y: 1.65 + i * 0.35, w: 2.6, h: 0.32, fontSize: 11, color: C.slate });
  });

  // Arrow
  s.addShape(pres.shapes.LINE, { x: 6.6, y: 3.0, w: 0.5, h: 0, line: { color: C.orange, width: 2 } });

  // Groq AI block
  s.addShape(pres.shapes.RECTANGLE, { x: 7.1, y: 1.1, w: 2.5, h: 3.8, fill: { color: C.navyMid }, line: { width: 0 }, shadow: shadow() });
  s.addShape(pres.shapes.RECTANGLE, { x: 7.1, y: 1.1, w: 2.5, h: 0.45, fill: { color: C.orange }, line: { width: 0 } });
  s.addText("Groq AI", { x: 7.1, y: 1.1, w: 2.5, h: 0.45, fontSize: 13, bold: true, color: C.white, align: "center", margin: 0 });
  const aiItems = ["🧾 Transcript extraction", "👁 Vision age estimation", "🔍 Fraud signal analysis", "🤖 Risk classification", "💳 Offer generation", "📋 Audit decision log"];
  aiItems.forEach((item, i) => {
    s.addText(item, { x: 7.2, y: 1.65 + i * 0.35, w: 2.3, h: 0.32, fontSize: 11, color: C.slateL });
  });

  // Stack label
  s.addText("Stack: React 18 · Vite · Node.js · Express · Groq API · Web Speech API", {
    x: 0.4, y: 5.15, w: 9.2, h: 0.3, fontSize: 10, color: C.slateL, align: "center"
  });
}

// ════════════════════════════════════════════
// SLIDE 5 — AI Intelligence Layer (Groq)
// ════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.offWhite };

  s.addText("AI Intelligence Layer", { x: 0.5, y: 0.35, w: 9, h: 0.55, fontSize: 30, color: C.navyMid, bold: true });
  s.addText("Powered by Groq — 4 specialized AI calls per session", { x: 0.5, y: 0.9, w: 9, h: 0.35, fontSize: 15, color: C.slate });

  const modules = [
    { icon: "🧾", title: "Transcript Intelligence", color: C.navyMid, items: ["Extracts: name, income, employer", "Detects verbal consent (auditable)", "Confidence score per field", "Identifies missing information", "Outputs structured JSON profile"] },
    { icon: "👤", title: "Vision Age Estimation", color: "065A82", items: ["Analyzes webcam screenshot", "Returns age range + confidence", "Flags: no face, poor lighting", "Adult verification (18+)", "Fraud mismatch detection"] },
    { icon: "🛡️", title: "Fraud Detection Engine", color: "6D2E46", items: ["Age declared vs. estimated gap", "Income-loan plausibility check", "Geo-location anomaly scan", "Severity: low / medium / high", "Structured flag + recommendation"] },
    { icon: "💰", title: "Loan Offer Generator", color: "1A4D2E", items: ["3 tiers: Conservative/Recommended/Premium", "Range: ₹1L–₹30L, 11%–29% p.a.", "EMI, tenure, processing fee", "Personalized message per customer", "Full audit log with decision trail"] },
  ];

  modules.forEach((m, i) => {
    const row = Math.floor(i / 2), col = i % 2;
    const x = 0.4 + col * 4.7, y = 1.45 + row * 2.0;
    s.addShape(pres.shapes.RECTANGLE, { x, y, w: 4.4, h: 1.75, fill: { color: C.white }, line: { width: 0 }, shadow: shadow() });
    s.addShape(pres.shapes.RECTANGLE, { x, y, w: 0.1, h: 1.75, fill: { color: m.color }, line: { width: 0 } });
    s.addText(m.icon + "  " + m.title, { x: x + 0.2, y: y + 0.12, w: 4.1, h: 0.4, fontSize: 13, bold: true, color: C.navyMid });
    m.items.forEach((item, j) => {
      s.addText("·  " + item, { x: x + 0.2, y: y + 0.52 + j * 0.23, w: 4.1, h: 0.22, fontSize: 10.5, color: C.slate });
    });
  });
}

// ════════════════════════════════════════════
// SLIDE 6 — Judging Criteria Coverage
// ════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.navy };

  s.addText("Judging Criteria — Full Coverage", { x: 0.5, y: 0.35, w: 9, h: 0.55, fontSize: 30, color: C.white, bold: true });

  const criteria = [
    ["End-to-end digitisation", "Zero paper. Full video → analysis → offer flow. No branch visit, no form.", 100],
    ["Accuracy & compliance", "Groq Vision KYC + verbal consent capture + auditable session log.", 95],
    ["Risk mitigation", "Multi-signal fraud engine: age mismatch, geo anomaly, income plausibility.", 92],
    ["Intelligence & personalization", "LLM classifies risk band + generates 3-tier personalized loan offers.", 96],
    ["Scalability & reliability", "Stateless REST API design. Session-based. Cloud-deployable in minutes.", 88],
  ];

  criteria.forEach(([label, desc, score], i) => {
    const y = 1.2 + i * 0.82;
    s.addShape(pres.shapes.RECTANGLE, { x: 0.4, y, w: 9.2, h: 0.7, fill: { color: C.navyMid }, line: { width: 0 } });

    // Score pill
    const pillColor = score >= 95 ? C.green : score >= 90 ? "1C5F82" : C.amber;
    s.addShape(pres.shapes.RECTANGLE, { x: 8.8, y: y + 0.13, w: 0.7, h: 0.44, fill: { color: pillColor }, line: { width: 0 } });
    s.addText(score + "%", { x: 8.8, y: y + 0.13, w: 0.7, h: 0.44, fontSize: 12, bold: true, color: C.white, align: "center", margin: 0 });

    // Bar fill
    const barW = (score / 100) * 7.8;
    s.addShape(pres.shapes.RECTANGLE, { x: 0.4, y: y + 0.62, w: barW, h: 0.06, fill: { color: pillColor }, line: { width: 0 } });

    s.addText(label, { x: 0.6, y: y + 0.08, w: 5, h: 0.28, fontSize: 13, bold: true, color: C.white });
    s.addText(desc, { x: 0.6, y: y + 0.36, w: 8.0, h: 0.24, fontSize: 10.5, color: C.slateL });
  });
}

// ════════════════════════════════════════════
// SLIDE 7 — Demo Screenshots (Mocked)
// ════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.offWhite };

  s.addText("Live Demo — 4-Step Flow", { x: 0.5, y: 0.35, w: 9, h: 0.55, fontSize: 30, color: C.navyMid, bold: true });

  const screens = [
    { icon: "🏠", label: "1. Landing", desc: "Customer enters via\nsecure link" },
    { icon: "🎥", label: "2. Video Call", desc: "AI agent interviews\nvia voice + camera" },
    { icon: "🧠", label: "3. AI Analysis", desc: "4-step real-time\nprocessing display" },
    { icon: "🎁", label: "4. Loan Offer", desc: "3-tier offer with\naudit log & fraud flags" },
  ];

  screens.forEach((sc, i) => {
    const x = 0.4 + i * 2.35;
    // Mock screen frame
    s.addShape(pres.shapes.RECTANGLE, { x, y: 1.0, w: 2.1, h: 3.5, fill: { color: C.navyMid }, line: { color: "2A47A8", width: 1 }, shadow: shadow() });
    // Screen content area
    s.addShape(pres.shapes.RECTANGLE, { x: x + 0.1, y: 1.15, w: 1.9, h: 2.8, fill: { color: C.navy }, line: { width: 0 } });
    s.addText(sc.icon, { x: x + 0.1, y: 1.6, w: 1.9, h: 0.9, fontSize: 44, align: "center" });
    // Fake UI lines
    [0, 1, 2].forEach(j => {
      s.addShape(pres.shapes.RECTANGLE, { x: x + 0.25, y: 2.6 + j * 0.28, w: 1.5 - j * 0.3, h: 0.14, fill: { color: "1A2E6B" }, line: { width: 0 } });
    });
    // Label below
    s.addText(sc.label, { x, y: 4.55, w: 2.1, h: 0.35, fontSize: 13, bold: true, color: C.navyMid, align: "center" });
    s.addText(sc.desc, { x, y: 4.9, w: 2.1, h: 0.5, fontSize: 10, color: C.slate, align: "center", lineSpacingMultiple: 1.3 });
  });

  s.addText("React frontend · Node.js backend · All AI calls powered by Groq llama3-70b-8192", {
    x: 0.5, y: 5.25, w: 9, h: 0.25, fontSize: 10, color: C.slateL, align: "center"
  });
}

// ════════════════════════════════════════════
// SLIDE 8 — Business Impact & Roadmap
// ════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.offWhite };

  s.addText("Business Impact & Roadmap", { x: 0.5, y: 0.35, w: 9, h: 0.55, fontSize: 30, color: C.navyMid, bold: true });

  // Impact stats
  const stats = [
    ["~80%", "Drop in KYC\nmanual effort"],
    ["2 min", "Full onboarding\nvs. 2-3 days"],
    ["3x", "Fraud detection\nvs. form-only"],
    ["100%", "Digital journey\nzero paper"],
  ];
  stats.forEach(([val, label], i) => {
    const x = 0.4 + i * 2.35;
    s.addShape(pres.shapes.RECTANGLE, { x, y: 1.1, w: 2.1, h: 1.4, fill: { color: C.navyMid }, line: { width: 0 }, shadow: shadow() });
    s.addText(val, { x, y: 1.2, w: 2.1, h: 0.65, fontSize: 34, bold: true, color: C.orange, align: "center" });
    s.addText(label, { x, y: 1.85, w: 2.1, h: 0.55, fontSize: 11, color: C.slateL, align: "center", lineSpacingMultiple: 1.25 });
  });

  // Roadmap
  s.addText("Roadmap", { x: 0.5, y: 2.75, w: 9, h: 0.4, fontSize: 18, bold: true, color: C.navyMid });
  const roadmap = [
    ["Phase 1 — Now", "Video KYC · Transcript AI · Age estimation · Fraud detection · Offer generation"],
    ["Phase 2 — Q3 2026", "Aadhaar/PAN OCR · CIBIL bureau API · Multi-language (Bhashini) · WhatsApp channel"],
    ["Phase 3 — Q4 2026", "Custom ML propensity model · Encrypted video storage · Lender dashboard · NBFC API"],
  ];
  roadmap.forEach(([phase, items], i) => {
    const y = 3.2 + i * 0.7;
    s.addShape(pres.shapes.RECTANGLE, { x: 0.4, y, w: 9.2, h: 0.58, fill: { color: C.white }, line: { width: 0 }, shadow: shadow() });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.4, y, w: 0.08, h: 0.58, fill: { color: i === 0 ? C.green : i === 1 ? C.navyLt : C.slateL }, line: { width: 0 } });
    s.addText(phase, { x: 0.6, y: y + 0.08, w: 1.8, h: 0.26, fontSize: 11, bold: true, color: C.navyMid });
    s.addText(items, { x: 2.5, y: y + 0.08, w: 7.0, h: 0.42, fontSize: 11, color: C.slate });
  });
}

// ════════════════════════════════════════════
// SLIDE 9 — Closing / Thank You
// ════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.navy };

  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.18, h: 5.625, fill: { color: C.orange }, line: { width: 0 } });

  s.addText("LoanWizard", { x: 0.5, y: 1.0, w: 9, h: 1.0, fontSize: 56, bold: true, color: C.white, align: "center" });
  s.addText("2-minute video. Instant offer. Zero paperwork.", { x: 0.5, y: 2.0, w: 9, h: 0.5, fontSize: 20, color: "CADCFC", align: "center" });

  // Three pillars
  const pillars = [["🎥", "Video AI"], ["🛡️", "Fraud Safe"], ["💰", "Instant Offer"]];
  pillars.forEach(([icon, label], i) => {
    const x = 1.8 + i * 2.5;
    s.addShape(pres.shapes.OVAL, { x, y: 2.8, w: 1.2, h: 1.2, fill: { color: C.orange, transparency: 80 }, line: { width: 0 } });
    s.addText(icon, { x, y: 2.85, w: 1.2, h: 0.7, fontSize: 30, align: "center" });
    s.addText(label, { x: x - 0.3, y: 3.65, w: 1.8, h: 0.35, fontSize: 12, color: C.slateL, align: "center" });
  });

  s.addText("TenzorX 2026 · Poonawalla Fincorp · Problem Statement 3", {
    x: 0.5, y: 5.0, w: 9, h: 0.35, fontSize: 11, color: C.slateL, align: "center"
  });

  s.addText("github.com/YOUR_USERNAME/loanwizard-tenzorx", {
    x: 0.5, y: 5.3, w: 9, h: 0.25, fontSize: 10, color: C.orange, align: "center"
  });
}

// ── Write file ──
const outPath = "/home/claude/loanwizard/LoanWizard_TenzorX2026.pptx";
pres.writeFile({ fileName: outPath })
  .then(() => console.log("✅ Deck saved:", outPath))
  .catch(e => { console.error("❌ Error:", e); process.exit(1); });

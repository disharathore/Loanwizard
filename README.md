# 🏦 LoanWizard — Agentic AI Video Call Based Loan Onboarding

> **TenzorX 2026 National AI Hackathon** · Poonawalla Fincorp · Problem Statement 3

[![Demo](https://img.shields.io/badge/Demo-Live-brightgreen)](http://localhost:5173)
[![AI](https://img.shields.io/badge/AI-Groq%20Llama3%2070B-blue)](https://console.groq.com)
[![Stack](https://img.shields.io/badge/Stack-React%20%2B%20Node.js-orange)](https://reactjs.org)

---

## 📌 Problem Statement

Traditional digital loan journeys face:
- High drop-offs due to complex forms
- Fraud risks from unverified identities
- Manual KYC overhead
- No real-time customer intent validation

**LoanWizard** solves this with a fully AI-driven video call onboarding system that replaces paperwork with a 2-minute conversation.

---

## 🎯 Solution Overview

An end-to-end digital loan origination system where:

1. Customer clicks a secure link → video call starts
2. AI agent conducts a structured interview via voice
3. Speech-to-Text captures and analyzes responses
4. Computer vision estimates customer age from video feed
5. Geo-location is captured for fraud validation
6. Groq AI classifies risk, detects fraud signals
7. Personalized loan offer is generated instantly
8. Full audit log is stored for compliance

---

## 🏗️ Architecture

```
Customer
    │
    ▼
[Video Call Session]  ←── Geo-location + Device metadata
    │
    ├── Speech-to-Text (Web Speech API)
    │       └── Extract: name, income, employment, purpose, consent
    │
        ├── Computer Vision (Groq Vision API)
    │       └── Age estimation from webcam screenshot
    │
    └── Fraud Signal Detection
            └── Geo mismatch, age inconsistency, liveness checks
                │
                ▼
        [LLM Intelligence Layer — Groq Llama 3 70B]
                │
                ▼
        [Risk + Policy Engine]
        Bureau data + ML score + rules
                │
                ▼
        [Loan Offer Generation]
        3 tiers: Conservative / Recommended / Premium
                │
                ▼
        [Audit Log + Consent Record]
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Backend | Node.js + Express |
| AI Engine | Groq (llama3-70b-8192) |
| Speech-to-Text | Web Speech API (browser-native) |
| Computer Vision | Groq Vision (meta-llama/llama-4-scout-17b-16e-instruct) |
| Styling | Custom CSS (no framework dependency) |

---

## 📂 Project Structure

```
loanwizard/
├── backend/
│   ├── index.js              # Express server
│   ├── package.json
│   ├── .env.example          # Environment variables template
│   └── routes/
│       ├── session.js        # Session lifecycle management
│       ├── analyze.js        # AI analysis pipeline
│       └── offer.js          # Loan offer generation
└── frontend/
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── App.jsx            # Step-based navigation
        ├── index.css          # Global styles
        └── pages/
            ├── Landing.jsx    # Onboarding entry page
            ├── VideoCall.jsx  # Live video + speech interview
            ├── Analysis.jsx   # Real-time AI analysis display
            └── Offer.jsx      # Loan offer + audit log
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- Groq API key ([get one here](https://console.groq.com))
- Modern browser (Chrome recommended for Speech API)

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/loanwizard-tenzorx
cd loanwizard-tenzorx

# Install backend
cd backend
npm install

# Install frontend (new terminal)
cd ../frontend
npm install
```

### 2. Configure Environment

```bash
cd backend
cp .env.example .env
```

Open `.env` and add your API key:
```
GROQ_API_KEY=gsk-your-key-here
PORT=5000
FRONTEND_URL=http://localhost:5173
```

### 3. Start the App

**Terminal 1 — Backend:**
```bash
cd backend
node index.js
# ✅ Server running on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# ✅ App running on http://localhost:5173
```

### 4. Open in Browser
Navigate to `http://localhost:5173` in Chrome

---

## 🎬 Demo Flow

### Full Video Mode
1. Click **"Start Video Interview"**
2. Allow camera + microphone access when prompted
3. Allow location access when prompted
4. Click **"Start Interview"** — the AI agent will speak questions
5. Answer each question clearly out loud
6. Watch the AI analysis page process your data in real-time
7. View your personalized loan offer

### Demo Mode (No Camera Required)
1. Click **"Demo mode (skip video, use sample data)"** on the video page
2. Pre-loaded sample data (Rahul Sharma, Infosys, ₹85k/mo) will be used
3. Full AI analysis and offer generation still runs live via Groq API

---

## 🤖 AI Features

### 1. Transcript Intelligence (Groq Llama 3 70B)
Extracts structured data from unstructured speech:
- Full name, employment type, employer
- Monthly income, loan purpose, amount
- Verbal consent detection (auditable trail)
- Confidence scoring per field

### 2. Age Estimation (Groq Vision)
- Analyzes webcam screenshot
- Returns age range + confidence score
- Flags: poor lighting, no face, multiple faces
- Adult verification for lending compliance

### 3. Fraud Detection (Groq Llama 3 70B)
Cross-validates all signals:
- Age declared vs. visually estimated mismatch
- Geo-location anomalies
- Income-loan amount plausibility
- Consent validity
- Generates structured fraud flags with severity levels

### 4. Loan Offer Generation (Groq Llama 3 70B)
Follows Poonawalla Fincorp guidelines:
- Loan range: ₹1L–₹30L
- Interest rates: 11%–29% p.a. based on risk
- Tenure: 12–60 months
- 3 tiers: Conservative, Recommended, Premium
- Includes processing fee, total cost, EMI breakdown

---

## 📋 Judging Criteria Coverage

| Criterion | Implementation |
|-----------|---------------|
| End-to-end digitisation | Zero paper — full video-to-offer flow |
| Accuracy & compliance | KYC via vision + consent capture |
| Risk mitigation | Multi-signal fraud detection |
| Intelligence & personalization | Groq LLM classification + 3-tier offers |
| Scalability | Stateless API design, session-based |

---

## 🔒 Security & Compliance

- Explicit verbal consent captured and logged
- Geo-location stored with timestamp
- Full audit trail (transcript, decisions, offers) persisted per session
- No raw video stored (only single screenshot for age estimation)
- All API calls server-side (API key never exposed to frontend)

---

## 🔮 Future Roadmap

- [ ] Aadhaar/PAN OCR integration for document verification
- [ ] Bureau API integration (CIBIL, Experian)
- [ ] Multi-language support (Hindi, Marathi, Tamil via Bhashini API)
- [ ] WhatsApp channel integration
- [ ] ML-based propensity scoring model
- [ ] Video recording storage with encryption

---

## 👥 Team

Built for **TenzorX 2026** — Poonawalla Fincorp National AI Hackathon

---

## 📄 License

MIT — built for hackathon demonstration purposes.

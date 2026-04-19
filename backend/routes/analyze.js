const express = require("express");
const router = express.Router();
const sessionRouter = require("./session");

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const TEXT_MODEL = "llama-3.3-70b-versatile";
const VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

const sessions = sessionRouter.sessions;

function extractJson(rawText) {
  const jsonMatch = rawText?.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON found in AI response");
  return JSON.parse(jsonMatch[0]);
}

async function callGroq(payload) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not set in backend/.env");
  }

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq request failed (${response.status}): ${errText}`);
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content || "";
}

function ensureSession(sessionId) {
  if (!sessionId) return null;
  if (!sessions[sessionId]) {
    sessions[sessionId] = {
      id: sessionId,
      createdAt: new Date().toISOString(),
      status: "initiated",
      geoLocation: null,
      transcript: "",
      extractedData: null,
      ageEstimate: null,
      fraudSignals: null,
      riskScore: null,
      offer: null,
    };
  }
  return sessions[sessionId];
}

// ---------- 1. Analyze transcript with Claude ----------
router.post("/transcript", async (req, res) => {
  const { sessionId, transcript, geoLocation } = req.body;

  if (!transcript) {
    return res.status(400).json({ error: "Transcript is required" });
  }

  try {
    const prompt = `You are an AI agent for Poonawalla Fincorp's loan onboarding system.
A customer has just completed a video call interview. Below is the transcript of their conversation.

TRANSCRIPT:
"""
${transcript}
"""

GEO-LOCATION: ${geoLocation ? `Latitude: ${geoLocation.latitude}, Longitude: ${geoLocation.longitude}` : "Not captured"}

Extract the following information from the transcript and return ONLY a valid JSON object:

{
  "fullName": "string or null",
  "declaredAge": "number or null",
  "employmentType": "salaried | self-employed | student | unemployed | null",
  "employerName": "string or null",
  "monthlyIncome": "number or null (in INR)",
  "loanPurpose": "string or null",
  "loanAmountRequested": "number or null (in INR)",
  "consentGiven": true | false,
  "consentStatement": "exact words customer used to give consent or null",
  "city": "string or null",
  "educationLevel": "string or null",
  "maritalStatus": "string or null",
  "existingLoans": true | false | null,
  "confidence": 0.0 to 1.0,
  "missingFields": ["array of important fields not captured"],
  "summary": "2-sentence summary of the customer's profile"
}

Be conservative. If something is not clearly stated, return null. Do not guess.`;

    const raw = await callGroq({
      model: TEXT_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a careful loan onboarding extraction AI. Return only strict JSON without markdown fences.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
      max_tokens: 1000,
    });

    const extractedData = extractJson(raw);

    // Store in session store
    const session = ensureSession(sessionId);
    if (session) {
      session.transcript = transcript;
      session.extractedData = extractedData;
      session.geoLocation = geoLocation || session.geoLocation;
      session.status = "transcript_analyzed";
    }

    res.json({ success: true, extractedData });
  } catch (err) {
    console.error("Transcript analysis error:", err);
    res.status(500).json({ error: "Failed to analyze transcript", details: err.message });
  }
});

// ---------- 2. Age estimation from image (base64) ----------
router.post("/age", async (req, res) => {
  const { sessionId, imageBase64 } = req.body;

  if (!imageBase64) {
    return res.status(400).json({ error: "Image is required" });
  }

  try {
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const raw = await callGroq({
      model: VISION_MODEL,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Data}`,
              },
            },
            {
              type: "text",
              text: `You are an age estimation AI for a financial institution's KYC process.
Analyze the face in this image and return ONLY a valid JSON object:

{
  "estimatedAge": number (best estimate),
  "ageRange": { "min": number, "max": number },
  "confidence": 0.0 to 1.0,
  "isAdult": true | false,
  "flags": ["array of any concerns like: no-face-detected, poor-lighting, face-covered, multiple-faces"],
  "note": "brief observation"
}

Be conservative. If face is unclear, set confidence below 0.5 and add appropriate flag.
This is for loan eligibility verification (minimum age 18).`,
            },
          ],
        },
      ],
      max_tokens: 300,
    });

    const ageData = extractJson(raw);

    const session = ensureSession(sessionId);
    if (session) {
      session.ageEstimate = ageData;
      session.status = "age_analyzed";
    }

    res.json({ success: true, ageData });
  } catch (err) {
    console.error("Age estimation error:", err);
    res.status(500).json({ error: "Age estimation failed", details: err.message });
  }
});

// ---------- 3. Fraud & risk signal analysis ----------
router.post("/fraud", async (req, res) => {
  const { sessionId, extractedData, ageData, geoLocation, declaredAge } = req.body;

  try {
    const prompt = `You are a fraud detection AI for Poonawalla Fincorp loan onboarding.

Analyze the following customer data for fraud signals and risk indicators:

EXTRACTED FROM INTERVIEW:
${JSON.stringify(extractedData, null, 2)}

AGE ESTIMATION (from video):
${JSON.stringify(ageData, null, 2)}

DECLARED AGE: ${declaredAge || "Not provided"}

GEO-LOCATION: ${geoLocation ? JSON.stringify(geoLocation) : "Not captured"}

Return ONLY a valid JSON object:
{
  "overallRisk": "low | medium | high",
  "riskScore": 0 to 100,
  "fraudFlags": [
    {
      "flag": "flag name",
      "severity": "low | medium | high",
      "description": "explanation"
    }
  ],
  "ageMismatch": {
    "detected": true | false,
    "declared": number or null,
    "estimated": number or null,
    "discrepancy": number or null
  },
  "positiveSignals": ["list of trust-positive signals found"],
  "recommendation": "approve | review | reject",
  "reasoning": "2-sentence explanation of overall assessment"
}`;

    const raw = await callGroq({
      model: TEXT_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a careful fraud analysis assistant for retail lending. Return only strict JSON.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
      max_tokens: 800,
    });

    const fraudAnalysis = extractJson(raw);

    const session = ensureSession(sessionId);
    if (session) {
      session.fraudSignals = fraudAnalysis;
      session.riskScore = fraudAnalysis?.riskScore ?? null;
      session.status = "fraud_analyzed";
    }

    res.json({ success: true, fraudAnalysis });
  } catch (err) {
    console.error("Fraud analysis error:", err);
    res.status(500).json({ error: "Fraud analysis failed", details: err.message });
  }
});

module.exports = router;

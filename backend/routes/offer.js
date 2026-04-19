const express = require("express");
const router = express.Router();
const sessionRouter = require("./session");

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const TEXT_MODEL = "llama-3.3-70b-versatile";
const sessions = sessionRouter.sessions;

function extractJson(rawText) {
  const jsonMatch = rawText?.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON found in AI response");
  return JSON.parse(jsonMatch[0]);
}

function buildFallbackOffer(extractedData = {}, ageData = {}, fraudAnalysis = {}) {
  const monthlyIncome = Number(extractedData.monthlyIncome || 0);
  const declaredAge = Number(extractedData.declaredAge || ageData.estimatedAge || 30);
  const incomeFloor = monthlyIncome > 0 ? monthlyIncome : 30000;
  const maxEligibleAmount = Math.max(100000, Math.min(1200000, Math.round(incomeFloor * 10)));
  const recommended = Math.round(maxEligibleAmount * 0.7);
  const conservative = Math.round(maxEligibleAmount * 0.45);
  const premium = Math.round(maxEligibleAmount * 0.9);
  const risk = fraudAnalysis?.overallRisk || "medium";
  const baseRate = risk === "low" ? 12.5 : 14.5;

  const makeOffer = (type, loanAmount, rate, tenure) => {
    const r = rate / 12 / 100;
    const emi = r === 0
      ? Math.round(loanAmount / tenure)
      : Math.round((loanAmount * r * Math.pow(1 + r, tenure)) / (Math.pow(1 + r, tenure) - 1));
    const processingFee = Math.round(loanAmount * 0.02);
    return {
      type,
      loanAmount,
      interestRate: Number(rate.toFixed(2)),
      tenure,
      emiPerMonth: emi,
      processingFee,
      totalCost: Math.round(emi * tenure + processingFee),
      highlight: type === "Recommended" ? "Balanced EMI and approval confidence" : type === "Premium" ? "Higher amount with flexible tenure" : "Lower EMI for safer repayment",
    };
  };

  return {
    eligible: true,
    offers: [
      makeOffer("Conservative", conservative, baseRate - 0.5, 24),
      makeOffer("Recommended", recommended, baseRate, 36),
      makeOffer("Premium", premium, baseRate + 1.25, 48),
    ],
    maxEligibleAmount,
    creditBand: risk === "low" ? "A" : "B+",
    nextSteps: [
      "Confirm KYC details",
      "Upload income proof",
      "Complete e-sign to disburse funds",
    ],
    conditions: [
      "Final approval subject to document verification",
      `Applicant age considered: ${declaredAge}`,
    ],
    validityDays: 7,
    personalizedMessage: `Hi ${extractedData.fullName || "there"}, based on your profile we have prepared a pre-approved offer for quick processing.`,
  };
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

// ---------- Generate Personalized Loan Offer ----------
router.post("/generate", async (req, res) => {
  const { extractedData, ageData, fraudAnalysis, sessionId } = req.body;

  if (!extractedData) {
    return res.status(400).json({ error: "Customer data is required" });
  }

  // Hard reject if high fraud risk
  if (fraudAnalysis?.recommendation === "reject") {
    return res.json({
      success: true,
      offer: null,
      status: "rejected",
      reason: "Application flagged for manual review due to risk signals.",
    });
  }

  try {
    const prompt = `You are a loan offer generation AI for Poonawalla Fincorp, a leading NBFC in India.

Based on the customer profile below, generate a personalized loan offer following Poonawalla Fincorp's lending guidelines.

CUSTOMER PROFILE:
${JSON.stringify(extractedData, null, 2)}

AGE VERIFICATION:
${JSON.stringify(ageData, null, 2)}

RISK ASSESSMENT:
${JSON.stringify(fraudAnalysis, null, 2)}

POONAWALLA FINCORP GUIDELINES:
- Personal loans: ₹1 lakh to ₹30 lakhs
- Interest rates: 11% to 29% p.a. based on risk profile
- Tenure: 12 to 60 months
- Processing fee: 2% to 3.5% of loan amount
- Minimum income: ₹20,000/month for salaried, ₹25,000/month for self-employed
- Must be 21-65 years old

Return ONLY a valid JSON object:
{
  "eligible": true | false,
  "offers": [
    {
      "type": "Conservative | Recommended | Premium",
      "loanAmount": number (in INR),
      "interestRate": number (percentage p.a.),
      "tenure": number (months),
      "emiPerMonth": number (in INR),
      "processingFee": number (in INR),
      "totalCost": number (in INR),
      "highlight": "key benefit in one line"
    }
  ],
  "maxEligibleAmount": number (in INR),
  "creditBand": "A+ | A | B+ | B | C",
  "nextSteps": ["array of 3 action items for the customer"],
  "conditions": ["any conditions attached to the offer"],
  "validityDays": number,
  "personalizedMessage": "warm 2-sentence message addressing customer by name if available"
}

Generate 3 offer tiers (conservative, recommended, premium) if eligible.
If not eligible, set eligible to false and offers to [].`;

    const raw = await callGroq({
      model: TEXT_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a retail lending decision assistant. Return only strict JSON without markdown.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.25,
      max_tokens: 1200,
    });

    let offerData = extractJson(raw);

    // Demo-safe fallback: if AI returns ineligible for non-high-risk profile,
    // still provide a conditional pre-approved offer for prototype walkthrough.
    if (!offerData?.eligible && fraudAnalysis?.overallRisk !== "high") {
      offerData = buildFallbackOffer(extractedData, ageData, fraudAnalysis);
    }

    // Build audit log
    const auditLog = {
      sessionId,
      timestamp: new Date().toISOString(),
      customerProfile: extractedData,
      ageVerification: ageData,
      riskAssessment: fraudAnalysis,
      offerGenerated: offerData,
      decisionBy: `AI (Groq ${TEXT_MODEL})`,
    };

    if (sessionId && sessions[sessionId]) {
      sessions[sessionId].offer = offerData;
      sessions[sessionId].status = offerData.eligible ? "offer_generated" : "offer_declined";
    }

    res.json({
      success: true,
      offer: offerData,
      status: offerData.eligible ? "approved" : "declined",
      auditLog,
    });
  } catch (err) {
    console.error("Offer generation error:", err);
    res.status(500).json({ error: "Offer generation failed", details: err.message });
  }
});

module.exports = router;

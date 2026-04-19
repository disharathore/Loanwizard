const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");

// In-memory session store (use Redis/DB in production)
const sessions = {};

// Create a new onboarding session
router.post("/create", (req, res) => {
  const sessionId = uuidv4();
  sessions[sessionId] = {
    id: sessionId,
    createdAt: new Date().toISOString(),
    status: "initiated",
    geoLocation: null,
    transcript: [],
    extractedData: {},
    ageEstimate: null,
    fraudSignals: {},
    riskScore: null,
    offer: null,
  };

  res.json({ sessionId, message: "Session created successfully" });
});

// Update session with geo-location
router.post("/:sessionId/geo", (req, res) => {
  const { sessionId } = req.params;
  const { latitude, longitude, accuracy } = req.body;

  if (!sessions[sessionId]) {
    return res.status(404).json({ error: "Session not found" });
  }

  sessions[sessionId].geoLocation = { latitude, longitude, accuracy, capturedAt: new Date().toISOString() };
  sessions[sessionId].status = "geo_captured";

  res.json({ success: true, message: "Geo-location captured" });
});

// Get session data
router.get("/:sessionId", (req, res) => {
  const { sessionId } = req.params;
  if (!sessions[sessionId]) {
    return res.status(404).json({ error: "Session not found" });
  }
  res.json(sessions[sessionId]);
});

// Export sessions so other routes can use it
router.sessions = sessions;

module.exports = router;

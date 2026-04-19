const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL_2,
  process.env.FRONTEND_URL_3,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser clients and same-origin requests with no Origin header.
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Routes
app.use("/api/session", require("./routes/session"));
app.use("/api/analyze", require("./routes/analyze"));
app.use("/api/offer", require("./routes/offer"));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`\n🚀 LoanWizard backend running on port ${PORT}`);
  console.log("📋 Health check: /api/health");
  console.log(`✅ Allowed origins: ${allowedOrigins.join(", ") || "(localhost + *.vercel.app)"}\n`);
});

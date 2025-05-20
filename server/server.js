// server.js

require("dotenv").config();
const express = require("express");
const cors    = require("cors");
const connectDB = require("./config/db");
const translate = require("google-translate-api-x");

const app = express();
connectDB().catch(err => console.error("MongoDB Connection Failed:", err));

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// 1) Auth
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/auth/forgot-password", require("./routes/forgotPasswordRoutes"));
app.use("/api/vendor/auth", require("./routes/vendorAuthRoutes"));

// 2) Public “places” and recommended
app.use("/api/places", require("./routes/placesRoutes"));


// 3) Other public APIs
app.use("/api/profile", require("./routes/profileRoutes"));
app.use("/api/searches", require("./routes/searchRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/saved-places", require("./routes/savedPlacesRoutes"));
app.use("/api/itineraries", require("./routes/itinerariesRoutes"));
app.use("/api/events", require("./routes/eventsRoutes"));




// 4) Vendor-protected
app.use("/api/vendor", require("./routes/vendorRoutes"));

// 5) Admin-protected
app.use("/api/admin/users",       require("./routes/adminUserRoutes"));
app.use("/api/admin/places",      require("./routes/adminPlaceRoutes"));
app.use("/api/admin/itineraries", require("./routes/adminItineraryRoutes"));
app.use("/api/admin/events",      require("./routes/adminEventRoutes"));
app.use("/api/admin/recommended", require("./routes/adminRecommended"));

// 6) Translation
app.post("/api/translate", async (req, res) => {
  const { text, from, to } = req.body;
  if (!text || !from || !to) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  try {
    const result = await translate(text, { from, to });
    res.json({ translatedText: result.text });
  } catch (error) {
    console.error("Translation Error:", error);
    res.status(500).json({ error: "Translation failed" });
  }
});

// 7) Health check
app.get("/", (req, res) => res.send("Guide Nepal API running…"));


app.use((err, req, res, next) => {
  console.error("Server error:", err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));


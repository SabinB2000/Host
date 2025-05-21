require("dotenv").config();
const express   = require("express");
const cors      = require("cors");
const connectDB = require("./config/db");
const translate = require("google-translate-api-x");
const path      = require("path");

const app = express();

// 1️⃣ Connect to MongoDB
connectDB().catch(err => console.error("MongoDB Connection Failed:", err));

// 2️⃣ CORS — allow only your frontend
app.use(
  cors({
    origin: process.env.FRONTEND_URL, // e.g., https://yourfrontendurl.com in production
    credentials: true,
  })
);

// 3️⃣ Body parser & static uploads
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// 4️⃣ API Routes
app.use("/api/auth",              require("./routes/authRoutes"));
app.use("/api/auth/forgot-password", require("./routes/forgotPasswordRoutes"));
app.use("/api/vendor/auth",       require("./routes/vendorAuthRoutes"));
app.use("/api/places",            require("./routes/placesRoutes"));
app.use("/api/profile",           require("./routes/profileRoutes"));
app.use("/api/searches",          require("./routes/searchRoutes"));
app.use("/api/users",             require("./routes/userRoutes"));
app.use("/api/saved-places",      require("./routes/savedPlacesRoutes"));
app.use("/api/itineraries",       require("./routes/itinerariesRoutes"));
app.use("/api/events",            require("./routes/eventsRoutes"));
app.use("/api/vendor",            require("./routes/vendorRoutes"));
app.use("/api/admin/users",       require("./routes/adminUserRoutes"));
app.use("/api/admin/places",      require("./routes/adminPlaceRoutes"));
app.use("/api/admin/itineraries", require("./routes/adminItineraryRoutes"));
app.use("/api/admin/events",      require("./routes/adminEventRoutes"));
app.use("/api/admin/recommended", require("./routes/adminRecommended"));

// 5️⃣ Translation endpoint
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

// 6️⃣ Health check
app.get("/", (req, res) => res.send("Guide Nepal API running…"));

// 7️⃣ Serve React frontend build files in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "client", "build")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client", "build", "index.html"));
  });
}

// 8️⃣ Global error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// 9️⃣ Start server on dynamic port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server listening on port ${PORT}`)
);

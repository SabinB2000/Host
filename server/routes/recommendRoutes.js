const express = require("express");
const router = express.Router();
const RecommendedPlace = require("../models/RecommendedPlace");
const axios = require("axios");
require("dotenv").config();

router.get("/places/recommended", async (req, res) => {
  try {
    const places = await RecommendedPlace.find()
      .populate("place", "name description location category")
      .sort("order");
    res.json(places);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/places/google", async (req, res) => {
  try {
    const query = req.query.query || "places in Nepal";
    if (!process.env.GOOGLE_MAPS_API_KEY) {
      throw new Error("Google Maps API key is missing in environment variables");
    }
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${process.env.GOOGLE_MAPS_API_KEY}`
    );
    if (response.data.status !== "OK" && response.data.status !== "ZERO_RESULTS") {
      throw new Error(`Google Places API error: ${response.data.status}`);
    }
    res.json(response.data);
  } catch (err) {
    console.error("Error fetching Google Places:", err.message);
    res.status(500).json({ message: "Failed to fetch places from Google Maps", error: err.message });
  }
});

module.exports = router;
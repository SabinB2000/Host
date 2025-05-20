// controllers/placeController.js
const axios            = require("axios");
const mongoose         = require("mongoose");
const Place            = require("../models/Place");
const RecommendedPlace = require("../models/RecommendedPlace");

/** 1) Recommended (unchanged) */
exports.getRecommendedPlaces = async (req, res, next) => {
  try {
    const places = await RecommendedPlace.find()
      .populate("place")
      .sort({ order: 1 })
      .lean();
    res.json(places);
  } catch (err) {
    next(err);
  }
};

/** 2) Nearby DB places (unchanged) */
exports.getNearbyPlaces = async (req, res, next) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ message: "Latitude and longitude are required" });
    }
    const places = await Place.find({
      location: {
        $near: {
          $geometry:    { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: 5000,
        },
      },
    })
    .limit(3)
    .lean();
    res.json(places);
  } catch (err) {
    next(err);
  }
};

/** 3) Text search proxy (unchanged) */
exports.searchPlacesByQuery = async (req, res, next) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ status: "ZERO_RESULTS", results: [] });

    const google = await axios.get(
      "https://maps.googleapis.com/maps/api/place/textsearch/json",
      {
        params: {
          query,
          key: process.env.GOOGLE_PLACES_API_KEY,
        },
      }
    );
    res.json(google.data);
  } catch (err) {
    next(err);
  }
};

/** 4) Google Place Details fallback */
exports.getGooglePlaceDetails = async (req, res, next) => {
  try {
    const placeId = req.params.id;
    const google = await axios.get(
      "https://maps.googleapis.com/maps/api/place/details/json",
      {
        params: {
          place_id: placeId,
          key:      process.env.GOOGLE_PLACES_API_KEY,
        },
      }
    );
    if (google.data.status !== "OK") {
      return res.status(502).json({ message: google.data.status });
    }
    // Return just the `result` object
    res.json(google.data.result);
  } catch (err) {
    next(err);
  }
};

/** 5) Get one place by ID, or fallback to Google if not a valid ObjectId */
exports.getPlaceById = async (req, res, next) => {
  const id = req.params.id;

  // If `id` isn't a 24-hex Mongo ObjectId, do Google Details instead
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return exports.getGooglePlaceDetails(req, res, next);
  }

  try {
    const place = await Place.findById(id).lean();
    if (!place) return res.status(404).json({ message: "Place not found in DB" });
    res.json(place);
  } catch (err) {
    next(err);
  }
};

/** 6) Similar DB places, or empty array if non-Mongo ID */
exports.getSimilarPlaces = async (req, res, next) => {
  const id = req.params.id;

  // If not a valid ObjectId, return no similar
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.json([]);
  }

  try {
    const me = await Place.findById(id).lean();
    if (!me) return res.status(404).json({ message: "Place not found in DB" });

    const [lng, lat] = me.location.coordinates;
    const similar = await Place.find({
      _id:      { $ne: me._id },
      category: me.category,
      location: {
        $near: {
          $geometry:    { type: "Point", coordinates: [lng, lat] },
          $maxDistance: 5000,
        },
      },
    })
    .limit(5)
    .lean();

    res.json(similar);
  } catch (err) {
    next(err);
  }
};

/** 7) POIs via Google Nearby Search (unchanged) */
exports.getNearbyPOIs = async (req, res, next) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) return res.status(400).json({ message: "Missing coordinates" });

    const google = await axios.get(
      "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
      {
        params: {
          location: `${lat},${lng}`,
          radius:   2000,
          key:      process.env.GOOGLE_PLACES_API_KEY,
        },
      }
    );
    if (google.data.status !== "OK") {
      return res.status(502).json({ message: google.data.status });
    }
    res.json(google.data.results.slice(0, 5));
  } catch (err) {
    next(err);
  }
};


exports.getAllDbPlaces = async (req, res, next) => {
  try {
    const places = await Place.find().lean();
    res.json(places);
  } catch (err) {
    next(err);
  }
};
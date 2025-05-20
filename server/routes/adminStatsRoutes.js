// routes/adminStatsRoutes.js
const express  = require("express");
const router   = express.Router();
const mongoose = require("mongoose");

// your models
const User      = require("../models/User");
const Place     = require("../models/Place");
const Itinerary = require("../models/Itinerary");
const Event     = require("../models/Event");

// only ensure the user is logged in
const { authenticate } = require("../middleware/authMiddleware");

// GET /api/admin/stats
router.get(
  "/stats",
  authenticate,
  async (req, res, next) => {
    // inline admin-only guard
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    try {
      const [ userCount, placeCount, itinCount, eventCount ] = await Promise.all([
        User.estimatedDocumentCount(),
        Place.estimatedDocumentCount(),
        Itinerary.estimatedDocumentCount(),
        Event.estimatedDocumentCount(),
      ]);

      res.json({
        users:        userCount,
        places:       placeCount,
        itineraries:  itinCount,
        events:       eventCount,
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;

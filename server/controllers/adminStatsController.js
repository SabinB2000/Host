// controllers/adminStatsController.js
const User = require("../models/User");
const Itinerary = require("../models/Itinerary");
const Place = require("../models/Place");
const Event = require("../models/Event");

exports.getStats = async (req, res) => {
  try {
    const [users, itineraries, places, events] = await Promise.all([
      User.countDocuments(),
      Itinerary.countDocuments(),
      Place.countDocuments(),
      Event.countDocuments(),
    ]);
    res.json({ users, itineraries, places, events });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not fetch stats" });
  }
};

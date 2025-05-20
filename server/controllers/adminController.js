// controllers/adminController.js
const User = require("../models/User");
const Place = require("../models/Place");
const Itinerary = require("../models/Itinerary");
const Event = require("../models/Event");  // Import the Event model

exports.getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPlaces = await Place.countDocuments();
    const totalItineraries = await Itinerary.countDocuments();
    const totalEvents = await Event.countDocuments();  // Count events

    res.status(200).json({ totalUsers, totalPlaces, totalItineraries, totalEvents });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// controllers/itineraryController.js
const Itinerary = require("../models/Itinerary");

/**
 * GET /api/itineraries
 * Return any itineraries that belong to this user
 * OR that were created by admin (user field null/undefined).
 */
exports.getItineraries = async (req, res) => {
  try {
    const userId = req.user._id;
    const list = await Itinerary.find({
      $or: [
        { user: userId },
        { user: { $exists: false } }
      ]
    }).lean();
    res.status(200).json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching itineraries" });
  }
};

exports.getItineraryById = async (req, res) => {
  try {
    const it = await Itinerary.findById(req.params.id).lean();
    if (!it) return res.status(404).json({ message: "Not found" });
    res.json(it);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// note the (req, res) here:
exports.createItinerary = async (req, res) => {
  try {
    // attach the user who’s creating this
    const newIt = new Itinerary({ ...req.body, user: req.user._id });
    await newIt.save();
    res.status(201).json(newIt);
  } catch (err) {
    console.error("Invalid data:", err);
    res.status(400).json({ message: "Invalid data", error: err.message });
  }
};

exports.updateItinerary = async (req, res) => {
  try {
    const updated = await Itinerary.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).lean();
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.status(200).json(updated);
  } catch (err) {
    console.error("Update failed:", err);
    res.status(400).json({ message: "Update failed", error: err.message });
  }
};

exports.deleteItinerary = async (req, res) => {
  try {
    const del = await Itinerary.findByIdAndDelete(req.params.id);
    if (!del) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error("Delete failed:", err);
    res.status(500).json({ message: "Delete failed" });
  }
};

// controllers/adminItineraryController.js
const Itinerary = require("../models/Itinerary");

// GET /api/admin/itineraries
exports.getAllItineraries = async (req, res) => {
  try {
    const list = await Itinerary.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching itineraries" });
  }
};

// GET /api/admin/itineraries/:id
exports.getItinerary = async (req, res) => {
  try {
    const it = await Itinerary.findById(req.params.id);
    if (!it) return res.status(404).json({ message: "Not found" });
    res.json(it);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/admin/itineraries
exports.createItinerary = async (req, res) => {
  try {
    const payload = {
      title:       req.body.title,
      description: req.body.description,
      days:        req.body.days || [],
    };
    const newIt = new Itinerary(payload);
    await newIt.save();
    res.status(201).json(newIt);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Invalid data", error: err.message });
  }
};

// PUT /api/admin/itineraries/:id
exports.updateItinerary = async (req, res) => {
  try {
    const payload = {
      title:       req.body.title,
      description: req.body.description,
      days:        req.body.days || [],
    };
    const upd = await Itinerary.findByIdAndUpdate(
      req.params.id,
      payload,
      { new: true }
    );
    if (!upd) return res.status(404).json({ message: "Not found" });
    res.json(upd);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Update failed", error: err.message });
  }
};

// DELETE /api/admin/itineraries/:id
exports.deleteItinerary = async (req, res) => {
  try {
    const del = await Itinerary.findByIdAndDelete(req.params.id);
    if (!del) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Delete failed" });
  }
};

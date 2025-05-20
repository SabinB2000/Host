// controllers/savedPlacesController.js
const SavedPlace = require("../models/SavedPlace");

// GET /api/saved-places
exports.getSavedPlaces = async (req, res) => {
  try {
    const saved = await SavedPlace.find({ user: req.user.id }).lean();
    res.json(saved);
  } catch (err) {
    console.error("Error fetching saved places:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/saved-places
exports.addSavedPlace = async (req, res) => {
  const { placeId } = req.body;
  if (!placeId) {
    return res.status(400).json({ message: "Missing placeId" });
  }

  try {
    // prevent duplicates
    const exists = await SavedPlace.findOne({
      user: req.user.id,
      placeId,
    });
    if (exists) {
      return res.status(400).json({ message: "Place already saved" });
    }

    const sp = await SavedPlace.create({
      user: req.user.id,
      placeId,
    });
    res.status(201).json(sp);
  } catch (err) {
    console.error("Error adding saved place:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/saved-places/:id
exports.removeSavedPlace = async (req, res) => {
  try {
    const sp = await SavedPlace.findById(req.params.id);
    if (!sp) return res.status(404).json({ message: "Not found" });
    if (sp.user.toString() !== req.user.id)
      return res.status(401).json({ message: "Unauthorized" });
    await sp.deleteOne();
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error("Error removing saved place:", err);
    res.status(500).json({ message: "Server error" });
  }
};

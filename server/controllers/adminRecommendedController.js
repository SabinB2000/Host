const RecommendedPlace = require("../models/RecommendedPlace");

// Admin CRUD for recommended places:
exports.getRecommendedPlaces = async (req, res) => {
  try {
    const list = await RecommendedPlace.find().sort("order");
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.createRecommendedPlace = async (req, res) => {
  try {
    const place = new RecommendedPlace(req.body);
    await place.save();
    res.status(201).json(place);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Invalid data", error: err.message });
  }
};

exports.updateRecommendedPlace = async (req, res) => {
  try {
    const place = await RecommendedPlace.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!place) return res.status(404).json({ message: "Not found" });
    res.json(place);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Update failed", error: err.message });
  }
};

exports.deleteRecommendedPlace = async (req, res) => {
  try {
    const place = await RecommendedPlace.findByIdAndDelete(req.params.id);
    if (!place) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Delete failed" });
  }
};

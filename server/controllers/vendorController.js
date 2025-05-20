// controllers/vendorController.js
const Place = require("../models/Place");
const mongoose = require("mongoose");

// (Optional) A simple dashboard summary
exports.getVendorDashboard = async (req, res) => {
  try {
    const count = await Place.countDocuments({ addedBy: req.user.id });
    res.json({ yourPlaceCount: count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching dashboard data." });
  }
};

exports.getVendorPlaces = async (req, res) => {
  try {
    const places = await Place.find({ addedBy: req.user.id }).sort({ createdAt: -1 });
    res.json(places);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching your places." });
  }
};

exports.getVendorPlaceById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ message: "Invalid ID." });
    const place = await Place.findOne({ _id: id, addedBy: req.user.id });
    if (!place) return res.status(404).json({ message: "Place not found." });
    res.json(place);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching the place." });
  }
};

exports.createVendorPlace = async (req, res) => {
  try {
    const { title, description, location } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : req.body.image || "";
    const newPlace = await Place.create({
      title,
      description,
      location,
      image,
      addedBy: req.user.id,
    });
    res.status(201).json(newPlace);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating place." });
  }
};

exports.updateVendorPlace = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = {
      title: req.body.title,
      description: req.body.description,
      location: req.body.location,
    };
    if (req.file) updates.image = `/uploads/${req.file.filename}`;
    const place = await Place.findOneAndUpdate(
      { _id: id, addedBy: req.user.id },
      updates,
      { new: true }
    );
    if (!place) return res.status(404).json({ message: "Place not found." });
    res.json(place);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating place." });
  }
};

exports.deleteVendorPlace = async (req, res) => {
  try {
    const { id } = req.params;
    const place = await Place.findOneAndDelete({ _id: id, addedBy: req.user.id });
    if (!place) return res.status(404).json({ message: "Place not found." });
    res.json({ message: "Place deleted successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting place." });
  }
};

exports.vendorLogout = (req, res) => {
  // Clear the token (assumes the token is stored in a cookie)
  res.cookie("token", "", {
    expires: new Date(0),
    httpOnly: true,
  });
  res.json({ message: "Vendor logged out successfully." });
};

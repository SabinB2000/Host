// controllers/adminPlaceController.js
const Place = require("../models/Place");

exports.getAllPlaces = async (req, res) => {
  const places = await Place.find();
  res.json(places);
};

exports.createPlace = async (req, res) => {
  const { title, description, location, image, category } = req.body;
  const newPlace = new Place({ title, description, location, image, category, addedBy: req.user._id });
  await newPlace.save();
  res.status(201).json(newPlace);
};

exports.updatePlace = async (req, res) => {
  const updated = await Place.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
};

exports.deletePlace = async (req, res) => {
  await Place.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
};

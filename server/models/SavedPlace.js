// models/SavedPlace.js
const mongoose = require("mongoose");

const savedPlaceSchema = new mongoose.Schema({
  // we store ANY string here—whether it’s a Google place_id or a Mongo _id
  placeId: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
}, { timestamps: true });

savedPlaceSchema.index({ user: 1, placeId: 1 }, { unique: true });


module.exports = mongoose.model("SavedPlace", savedPlaceSchema);

const mongoose = require("mongoose");

const placeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  category: {
    type: String,
    enum: ["Temple", "Attraction", "Market", "Park", "Cafe", "Museum"], // Added "Market"
    required: true,
  },
  image: { type: String, required: true },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});
placeSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Place", placeSchema);
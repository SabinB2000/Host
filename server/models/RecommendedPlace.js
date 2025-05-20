const mongoose = require("mongoose");

const recommendedPlaceSchema = new mongoose.Schema(
  {
    place: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Place",
      required: true,
      validate: {
        validator: (id) => mongoose.Types.ObjectId.isValid(id),
        message: "Invalid place ID",
      },
    },
    order: {
      type: Number,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    shortDescription: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RecommendedPlace", recommendedPlaceSchema);
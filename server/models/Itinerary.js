// models/Itinerary.js
const mongoose = require("mongoose");

const ActivitySchema = new mongoose.Schema({
  time:  { type: String, default: "" },        // optional e.g. "09:00"
  title: { type: String, required: true },     // free-form text
  notes: { type: String, default: "" },        // extra details
});

const DaySchema = new mongoose.Schema({
  dayNumber:  { type: Number, required: true },
  activities: [ActivitySchema],
});

const ItinerarySchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String, default: "" },
  days:        [DaySchema],
  createdAt:   { type: Date,   default: Date.now },
});

module.exports = mongoose.model("Itinerary", ItinerarySchema);

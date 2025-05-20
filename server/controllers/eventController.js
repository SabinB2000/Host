const Event = require("../models/Event");

// ✅ Get all events
const getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch events", error: err.message });
  }
};

// ✅ Create new event
const createEvent = async (req, res) => {
  try {
    const { title, description, location, date } = req.body;
    const event = new Event({
      title,
      description,
      date,
      location,
      createdBy: req.user.id
    });
    await event.save();
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ message: "Failed to create event", error: err.message });
  }
};

// ✅ Delete event
const deleteEvent = async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: "Event deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed", error: err.message });
  }
};

module.exports = {
  getEvents,       // ✅ Make sure this name matches your route
  createEvent,
  deleteEvent,
};

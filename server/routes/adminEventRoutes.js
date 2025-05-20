const express = require("express");
const router = express.Router();

const {
  getEvents,
  createEvent,
  deleteEvent,
} = require("../controllers/eventController");

const { authenticate, isAdmin } = require("../middleware/authMiddleware");

// ✅ Admin-specific event routes
router.get("/", authenticate, isAdmin, getEvents);
router.post("/", authenticate, isAdmin, createEvent);
router.delete("/:id", authenticate, isAdmin, deleteEvent);

module.exports = router;

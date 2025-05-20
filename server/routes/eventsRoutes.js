const express = require("express");
const router = express.Router();
const { getEvents, createEvent, deleteEvent } = require("../controllers/eventController");
const { authenticate, isAdmin } = require("../middleware/authMiddleware");

// ✅ Public route (for users)
router.get("/", getEvents);

// ✅ Admin routes
router.post("/", authenticate, isAdmin, createEvent);
router.delete("/:id", authenticate, isAdmin, deleteEvent);

module.exports = router;

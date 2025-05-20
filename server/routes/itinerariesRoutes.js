const express = require("express");
const router  = express.Router();
const { authenticate } = require("../middleware/authMiddleware");
const {
  getItineraries,
  getItineraryById,
  createItinerary,
  updateItinerary,
  deleteItinerary
} = require("../controllers/itineraryController");

// all endpoints require login:
router.use(authenticate);

router.get("/",         getItineraries);
router.get("/:id",      getItineraryById);
router.post("/",        createItinerary);
router.put("/:id",      updateItinerary);
router.delete("/:id",   deleteItinerary);

module.exports = router;

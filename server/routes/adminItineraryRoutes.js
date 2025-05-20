// routes/adminItineraryRoutes.js
const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/adminItineraryController");
const { authenticate, authorizeRole } = require("../middleware/authMiddleware");

// Protect all of these to admins only
router.use(authenticate, authorizeRole("admin"));

router.get("/",      ctrl.getAllItineraries);
router.get("/:id",   ctrl.getItinerary);
router.post("/",     ctrl.createItinerary);
router.put("/:id",   ctrl.updateItinerary);
router.delete("/:id",ctrl.deleteItinerary);

module.exports = router;

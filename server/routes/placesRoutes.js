// routes/placesRoutes.js
const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/placeController");

// existing…
router.get("/recommended",    ctrl.getRecommendedPlaces);
router.get("/nearby",         ctrl.getNearbyPlaces);
router.get("/google",         ctrl.searchPlacesByQuery);

// NEW: fetch all DB places
router.get("/db",             ctrl.getAllDbPlaces);

// detail + similar + poi remain as before
router.get("/db/:id",         ctrl.getPlaceById);
router.get("/db/:id/similar", ctrl.getSimilarPlaces);
router.get("/poi",            ctrl.getNearbyPOIs);

module.exports = router;

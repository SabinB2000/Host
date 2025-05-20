// routes/savedPlacesRoutes.js
const express = require("express");
const router  = express.Router();
const { authenticate } = require("../middleware/authMiddleware");
const ctrl    = require("../controllers/savedPlacesController");

router.get(   "/",        authenticate, ctrl.getSavedPlaces);
router.post(  "/",        authenticate, ctrl.addSavedPlace);
router.delete("/:id",     authenticate, ctrl.removeSavedPlace);

module.exports = router;

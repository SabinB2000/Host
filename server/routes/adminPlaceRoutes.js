// routes/adminPlaceRoutes.js
const express = require("express");
const router  = express.Router();
const { authenticate, isAdmin } = require("../middleware/authMiddleware");
const adminCtrl = require("../controllers/adminPlaceController");

// all admin‐place routes require a valid JWT + admin role:
router.use(authenticate, isAdmin);

router.get(   "/",       adminCtrl.getAllPlaces);
router.post(  "/",       adminCtrl.createPlace);
router.put(   "/:id",    adminCtrl.updatePlace);
router.delete("/:id",    adminCtrl.deletePlace);

module.exports = router;

const express = require("express");
const router  = express.Router();
const rc      = require("../controllers/adminRecommendedController");
const { authenticate, isAdmin } = require("../middleware/authMiddleware");

// all routes below require admin:
router.use(authenticate, isAdmin);

router.get(   "/",            rc.getRecommendedPlaces);
router.post(  "/",            rc.createRecommendedPlace);
router.put(   "/:id",         rc.updateRecommendedPlace);
router.delete("/:id",         rc.deleteRecommendedPlace);

module.exports = router;

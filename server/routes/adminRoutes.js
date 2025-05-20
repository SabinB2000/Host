const express = require("express");
const { authenticate, isAdmin } = require("../middleware/authMiddleware"); // ✅ Fix this
const { getAdminStats } = require("../controllers/adminController");

const router = express.Router();

// ✅ Admin stats route (protected)
router.get("/stats", authenticate, isAdmin, getAdminStats);

module.exports = router;

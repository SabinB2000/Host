// routes/userProfileRoutes.js
const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/authMiddleware");
const {
  getUserSettings,
  updateUserSettings,
  getActivityHistory,
  getRecommendations,
  postFeedback,
  deleteAccount,
} = require("../controllers/userProfileController");

// GET user settings
router.get("/settings", authenticate, getUserSettings);

// Update user settings
router.put("/settings", authenticate, updateUserSettings);

// Get activity history
router.get("/history", authenticate, getActivityHistory);

// Get personalized recommendations
router.get("/recommendations", authenticate, getRecommendations);

// Submit feedback
router.post("/feedback", authenticate, postFeedback);

// Delete (or deactivate) account
router.delete("/delete", authenticate, deleteAccount);

module.exports = router;

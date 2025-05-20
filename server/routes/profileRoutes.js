const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/authMiddleware");
const { getProfile, updateProfile, changePassword } = require("../controllers/profileController");
const multer = require("multer");
const path = require("path");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Ensure this folder exists
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});
const upload = multer({ storage });

router.get("/me", authenticate, getProfile);
router.put("/update", authenticate, upload.single("profilePicture"), updateProfile);
router.put("/change-password", authenticate, changePassword);

module.exports = router;

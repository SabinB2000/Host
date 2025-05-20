// routes/vendorRoutes.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const {
  authenticate,
  authorizeRole,
} = require("../middleware/authMiddleware");
const {
  getVendorDashboard,
  getVendorPlaces,
  getVendorPlaceById,
  createVendorPlace,
  updateVendorPlace,
  deleteVendorPlace,
} = require("../controllers/vendorController");

const router = express.Router();

// multer setup for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});
const upload = multer({ storage });

// Public vendor auth lives in /api/vendor/auth

// Protected vendor routes
router.use(authenticate, authorizeRole("vendor"));

router.get("/dashboard", getVendorDashboard);
router.get("/places", getVendorPlaces);
router.get("/places/:id", getVendorPlaceById);
router.post("/places", upload.single("image"), createVendorPlace);
router.put("/places/:id", upload.single("image"), updateVendorPlace);
router.delete("/places/:id", deleteVendorPlace);

module.exports = router;

// controllers/vendorAuthController.js
const User = require("../models/User"); // using the same User model for vendors
const bcrypt = require("bcryptjs");
const jwt    = require("jsonwebtoken");

// Vendor signup
exports.vendorSignup = async (req, res) => {
  const { name, email, password, businessName } = req.body;
  try {
    // ensure unique vendor email
    if (await User.findOne({ email, role: "vendor" })) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email,
      password: hashed,
      role: "vendor",
      businessName,
    });

    // sign token with the new user's id
    const token = jwt.sign(
      { id: user._id, role: "vendor" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, role: user.role, businessName: user.businessName },
    });
  } catch (err) {
    console.error("❌ vendorSignup error:", err);
    res.status(500).json({ message: "Server error during vendor signup" });
  }
};

// Vendor login
exports.vendorLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email, role: "vendor" });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: { id: user._id, name: user.name, role: user.role, businessName: user.businessName },
    });
  } catch (err) {
    console.error("❌ vendorLogin error:", err);
    res.status(500).json({ message: "Server error during vendor login" });
  }
};

// Optional: Vendor logout (if you need to blacklist tokens or clear cookies)
exports.vendorLogout = async (req, res) => {
  // If you store JWTs in a blacklist, add req.user.id here.
  // Otherwise, client‑only logout is sufficient.
  res.json({ message: "Logged out" });
};

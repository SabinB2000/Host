const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const User = require("../models/User");
const PasswordReset = require("../models/PasswordReset"); // a new mongoose model
const { sendMail } = require("../utils/mailer");

// 1) Request reset: generate a token, email it
router.post("/request", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "No account with that email" });

  // generate a cryptographically strong token
  const token = crypto.randomBytes(32).toString("hex");
  const expires = Date.now() + 1000 * 60 * 30; // 30 minutes

  // upsert into PasswordReset collection
  await PasswordReset.findOneAndUpdate(
    { userId: user._id },
    { token, expires },
    { upsert: true, new: true }
  );

  // send reset link
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}&id=${user._id}`;
  await sendMail({
    to: email,
    subject: "GuideNepal Password Reset",
    html: `<p>You requested a password reset. Click <a href="${resetLink}">here</a> to set a new password. This link expires in 30 minutes.</p>`
  });

  res.json({ message: "Password reset link sent to your email" });
});

// 2) Perform reset: verify token & update password
router.post("/reset", async (req, res) => {
  const { userId, token, newPassword } = req.body;
  if (!userId || !token || !newPassword)
    return res.status(400).json({ message: "Missing fields" });

  const record = await PasswordReset.findOne({ userId, token });
  if (!record || record.expires < Date.now()) {
    return res.status(400).json({ message: "Token invalid or expired" });
  }

  // Update user’s password
  const bcrypt = require("bcryptjs");
  const hashed = await bcrypt.hash(newPassword, 10);
  await User.findByIdAndUpdate(userId, { password: hashed });

  // Remove the reset token
  await PasswordReset.deleteOne({ userId });

  res.json({ message: "Password has been reset successfully" });
});

module.exports = router;

// controllers/passwordController.js

const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { saveOtp, verifyOtp } = require("../utils/otpStore");
const { sendMail } = require("../utils/mailer");

// Must be 8+ chars, upper + lower + digit + symbol
const passwordPolicy = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

// 1) Send reset code (only if email exists)
exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  // 1a) ensure account exists
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "No account found with that email" });

  // 1b) generate & store code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  try {
    await saveOtp(email, code);
    await sendMail({
      to: email,
      subject: "GuideNepal Password Reset Code",
      html: `<p>Your password reset code is <b>${code}</b>. It expires in 10 minutes.</p>`
    });
    res.json({ message: "Reset code sent" });
  } catch (err) {
    console.error("Reset-request error:", err);
    res.status(500).json({ message: "Failed to send reset code" });
  }
};

// 2) Consume reset code + change password
exports.resetPassword = async (req, res) => {
  const { email, otp, password } = req.body;
  if (!email || !otp || !password) {
    return res.status(400).json({ message: "Email, code and new password are required" });
  }

  // 2a) verify code
  let ok;
  try {
    ok = await verifyOtp(email, otp);
  } catch (err) {
    console.error("Reset-verify error:", err);
    return res.status(500).json({ message: "OTP verification failed" });
  }
  if (!ok) return res.status(400).json({ message: "Invalid or expired code" });

  // 2b) enforce policy
  if (!passwordPolicy.test(password)) {
    return res.status(400).json({
      message:
        "Password must be 8+ chars, include uppercase, lowercase, number & symbol",
    });
  }

  // 2c) hash & update
  try {
    const hashed = await bcrypt.hash(password, 10);
    await User.updateOne({ email }, { password: hashed });
    res.json({ message: "Password successfully reset" });
  } catch (err) {
    console.error("Reset-save error:", err);
    res.status(500).json({ message: "Failed to reset password" });
  }
};

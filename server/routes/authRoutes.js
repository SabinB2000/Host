// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { sendMail } = require('../utils/mailer');
const { saveOtp, verifyOtp } = require('../utils/otpStore');
const { registerUser, loginUser, getProfile } = require('../controllers/authController');
const { requestPasswordReset, resetPassword } = require("../controllers/passwordController");
const { authenticate } = require('../middleware/authMiddleware');

// 1) Request an OTP
//    Frontend: POST /api/auth/request-otp { email }
router.post('/request-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  // generate 6‑digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    // save to Redis with 10‑min TTL
    await saveOtp(email, code);

    // send email
    await sendMail({
      to: email,
      subject: 'Your GuideNepal verification code',
      html: `<p>Your OTP is <b>${code}</b>. It expires in 10 minutes.</p>`
    });

    res.json({ message: 'OTP sent' });
  } catch (err) {
    console.error('Request-OTP error:', err);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});

// 2) Verify an OTP
//    Frontend: POST /api/auth/verify-otp { email, otp }
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ message: 'Missing email or OTP' });

  try {
    const ok = await verifyOtp(email, otp);
    if (!ok) return res.status(400).json({ message: 'Invalid or expired OTP' });
    res.json({ message: 'OTP verified' });
  } catch (err) {
    console.error('Verify-OTP error:', err);
    res.status(500).json({ message: 'OTP verification failed' });
  }
});

// 3) Sign‑up (must have verified OTP already)
//    Frontend: POST /api/auth/signup { firstName, lastName, email, password, otp }
router.post(
  '/signup',
  async (req, res, next) => {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Missing email or OTP' });

    try {
      const ok = await verifyOtp(email, otp);
      if (!ok) return res.status(400).json({ message: 'Invalid or expired OTP' });
      // OTP was valid and deleted; proceed
      next();
    } catch (err) {
      console.error('Signup middleware error:', err);
      return res.status(500).json({ message: 'OTP check failed' });
    }
  },
  registerUser
);

// 1) Request reset code
router.post("/forgot-password/request", requestPasswordReset);

// 2) Reset with code
router.post("/forgot-password/reset", resetPassword);


// 4) Login & profile
//    Frontend: POST /api/auth/login { email, password }
router.post('/login', loginUser);

//    Frontend: GET /api/auth/profile/me
router.get('/profile/me', authenticate, getProfile);

module.exports = router;

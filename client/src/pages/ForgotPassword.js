// src/pages/ForgotPassword.js
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import axios from 'axios';
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import "../styles/ForgotPassword.css";

export default function ForgotPassword({ hideLoginLink = false }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const API = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

  // for public mode
  const [email, setEmail] = useState("");
  // for both
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [step, setStep] = useState("request"); // or "reset"
  const [loading, setLoading] = useState(false);

  // email to actually use:
  const emailToUse = hideLoginLink ? user?.email : email;

  const validEmail = (e) => /^\S+@\S+\.\S+$/.test(e);
  const validPassword = (p) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(p);

  const sendOtp = async () => {
    // public mode: validate typed email
    if (!hideLoginLink && !validEmail(email)) {
      return Swal.fire("Error", "Enter a valid email", "error");
    }
    setLoading(true);
    try {
      await axios.post(`${API}/auth/forgot-password/request`, {
        email: emailToUse,
      });
      Swal.fire("Sent", "Check your inbox for a reset code", "success");
      setStep("reset");
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    if (!otp) return Swal.fire("Error", "Enter the code", "error");
    if (!validPassword(password))
      return Swal.fire(
        "Weak password",
        "Use ≥8 chars, upper+lower+digit+symbol",
        "error"
      );
    if (password !== confirm)
      return Swal.fire("Error", "Passwords must match", "error");

    setLoading(true);
    try {
      await axios.post(`${API}/auth/forgot-password/reset`, {
        email: emailToUse,
        otp,
        password,
      });
      Swal.fire("Success", "Your password was changed", "success");
      // if coming from profile, log them out so sidebar disappears
      if (hideLoginLink) logout();
      // redirect to login (or home if you don't have /login)
      navigate("/login");
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="forgot-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {step === "request" ? (
        <div className="forgot-box">
          <h2>Forgot Password</h2>
          <p>
            {hideLoginLink
              ? `We’ll send a reset code to ${emailToUse}`
              : "Enter your account email to receive a reset code."}
          </p>

          {!hideLoginLink && (
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          )}

          <motion.button
            className="btn"
            onClick={sendOtp}
            disabled={loading}
            whileTap={{ scale: 0.95 }}
          >
            {loading ? "Sending…" : "Send Reset Code"}
          </motion.button>

          {!hideLoginLink && (
            <p className="remembered-line">
              Remembered? <Link to="/login">Log in</Link>
            </p>
          )}
        </div>
      ) : (
        <form className="forgot-box" onSubmit={resetPassword}>
          <h2>Reset Password</h2>
          <p>
            We sent a code to <strong>{emailToUse}</strong>
          </p>
          <input
            type="text"
            placeholder="Verification code"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
          <motion.button
            type="submit"
            className="btn"
            disabled={loading}
            whileTap={{ scale: 0.95 }}
          >
            {loading ? "Updating…" : "Update Password"}
          </motion.button>
        </form>
      )}
    </motion.div>
  );
}

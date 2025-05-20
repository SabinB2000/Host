import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../utils/axiosConfig"; // Use axiosInstance
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiEye,
  FiEyeOff,
  FiX,
  FiUser,
  FiBriefcase,
  FiMail,
  FiLock,
  FiCheck,
} from "react-icons/fi";
import "../styles/AuthForm.css";
import { useAuth } from "../contexts/AuthContext";

export default function AuthForm({ closeAuth }) {
  const navigate = useNavigate();
  const { login, user } = useAuth();

  const [mode, setMode] = useState("login");
  const [role, setRole] = useState("user");
  const [step, setStep] = useState("form");
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    businessName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });
  const [otp, setOtp] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (user) {
      const dest = user.role === "vendor" ? "/vendor/dashboard" : "/dashboard";
      navigate(dest, { replace: true });
      closeAuth?.();
    }
  }, [user, navigate, closeAuth]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const validEmail = (email) => /^\S+@\S+\.\S+$/.test(email);
  const validPassword = (pw) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(pw);

  const handleRequestOtp = async () => {
    if (!validEmail(form.email)) {
      return Swal.fire("Error", "Enter a valid email address", "error");
    }
    if (mode === "signup") {
      if (!form.firstName || !form.lastName) {
        return Swal.fire("Error", "First name and last name are required", "error");
      }
      if (!validPassword(form.password)) {
        return Swal.fire(
          "Weak password",
          "Use ≥8 chars, upper&lower, number & symbol",
          "error"
        );
      }
      if (form.password !== form.confirmPassword) {
        return Swal.fire("Error", "Passwords must match", "error");
      }
      if (!form.agree) {
        return Swal.fire("Error", "You must agree to T&C", "error");
      }
    }

    try {
      await axiosInstance.post("/auth/request-otp", { email: form.email });
      setStep("otp");
      Swal.fire("Check your inbox", "We sent you a verification code", "info");
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || err.message, "error");
    }
  };

  const handleVerifyAndSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const url = role === "vendor" ? "/vendor/auth/signup" : "/auth/signup";
      await axiosInstance.post(url, { ...form, otp });
      Swal.fire("Success", "Registration complete! Please log in.", "success");
      setMode("login");
      setStep("form");
      setForm({
        firstName: "",
        lastName: "",
        businessName: "",
        email: "",
        password: "",
        confirmPassword: "",
        agree: false,
      });
      setOtp("");
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === "signup") {
      return handleRequestOtp();
    }

    setIsLoading(true);
    try {
      const url = role === "vendor" ? "/vendor/auth/login" : "/auth/login";
      const { data } = await axiosInstance.post(url, {
        email: form.email,
        password: form.password,
      });
      login(data.user, data.token);
      navigate(data.user.role === "vendor" ? "/vendor/dashboard" : "/dashboard");
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode((m) => (m === "login" ? "signup" : "login"));
    setStep("form");
    setForm({
      firstName: "",
      lastName: "",
      businessName: "",
      email: "",
      password: "",
      confirmPassword: "",
      agree: false,
    });
    setOtp("");
  };

  const handleForgot = () => {
    closeAuth?.();
    navigate("/forgot-password");
  };

  return (
    <AnimatePresence>
      <motion.div
        className="auth-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="auth-container"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
        >
          <button className="close-btn" onClick={() => closeAuth?.()}>
            <FiX size={18} />
          </button>

          <div className="auth-header">
            <h2>
              {mode === "login"
                ? "Welcome Back"
                : step === "form"
                ? "Create Account"
                : "Enter Verification Code"}
            </h2>
            <p>
              {mode === "login"
                ? "Sign in to continue"
                : step === "form"
                ? "Fill in your details"
                : "We’ve emailed you a code"}
            </p>
          </div>

          <div className="role-selector">
            <button
              className={`role-btn ${role === "user" ? "active" : ""}`}
              onClick={() => setRole("user")}
              disabled={mode === "login"}
            >
              <FiUser className="role-icon" /> Traveler
            </button>
            <button
              className={`role-btn ${role === "vendor" ? "active" : ""}`}
              onClick={() => setRole("vendor")}
              disabled={mode === "login"}
            >
              <FiBriefcase className="role-icon" /> Vendor
            </button>
          </div>

          <form
            onSubmit={step === "otp" ? handleVerifyAndSignup : handleSubmit}
          >
            {step === "form" ? (
              <>
                {mode === "signup" && (
                  <>
                    <div className="form-group">
                      <div className="input-wrapper">
                        <FiUser className="input-icon" />
                        <input
                          name="firstName"
                          placeholder="First Name"
                          value={form.firstName}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <div className="input-wrapper">
                        <FiUser className="input-icon" />
                        <input
                          name="lastName"
                          placeholder="Last Name"
                          value={form.lastName}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                    {role === "vendor" && (
                      <div className="form-group">
                        <div className="input-wrapper">
                          <FiBriefcase className="input-icon" />
                          <input
                            name="businessName"
                            placeholder="Business Name"
                            value={form.businessName}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}

                <div className="form-group">
                  <div className="input-wrapper">
                    <FiMail className="input-icon" />
                    <input
                      type="email"
                      name="email"
                      placeholder="Email Address"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <div className="input-wrapper">
                    <FiLock className="input-icon" />
                    <input
                      type={showPass ? "text" : "password"}
                      name="password"
                      placeholder="Password"
                      value={form.password}
                      onChange={handleChange}
                      required
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowPass((s) => !s)}
                    >
                      {showPass ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                {mode === "signup" && (
                  <div className="form-group">
                    <div className="input-wrapper">
                      <FiLock className="input-icon" />
                      <input
                        type={showConfirm ? "text" : "password"}
                        name="confirmPassword"
                        placeholder="Confirm Password"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        required
                      />
                      <button
                        type="button"
                        className="toggle-password"
                        onClick={() => setShowConfirm((s) => !s)}
                      >
                        {showConfirm ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                  </div>
                )}

                {mode === "signup" && (
                  <div className="terms-group">
                    <label className="checkbox-container">
                      <input
                        type="checkbox"
                        name="agree"
                        checked={form.agree}
                        onChange={handleChange}
                        required
                      />
                      <span className="checkmark">
                        {form.agree && <FiCheck />}
                      </span>
                      I agree to the{" "}
                      <Link to="/terms" target="_blank">
                        Terms & Conditions
                      </Link>
                    </label>
                  </div>
                )}

                <motion.button
                  type="submit"
                  className="auth-btn"
                  disabled={isLoading}
                >
                  {mode === "signup"
                    ? "Send Verification Code"
                    : "Sign In"}
                </motion.button>
              </>
            ) : (
              <div className="otp-section">
                <div className="form-group">
                  <div className="input-wrapper">
                    <input
                      type="text"
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <motion.button
                  type="submit"
                  className="auth-btn"
                  disabled={isLoading}
                >
                  Verify & Sign Up
                </motion.button>
              </div>
            )}
          </form>

          <div className="auth-footer">
            {mode === "login" && (
              <button
                className="forgot-link"
                onClick={() => {
                  closeAuth?.();
                  navigate("/forgot-password");
                }}
              >
                Forgot password?
              </button>
            )}
            <p>
              {mode === "login" ? "Don't have an account?" : "Already have one?"}{" "}
              <button className="mode-toggle-btn" onClick={toggleMode}>
                {mode === "login" ? "Sign Up" : "Sign In"}
              </button>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
// src/pages/Profile.js

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import {
  FiEdit,
  FiLock,
  FiEye,
  FiEyeOff,
  FiUser,
  FiMail,
  FiUpload,
  FiX,
  FiCheck,
} from "react-icons/fi";
import "../styles/Profile.css";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Editing states
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    profilePicture: "",
  });

  // Password data
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
  });

  // Preview image
  const [previewImage, setPreviewImage] = useState("/assets/default-profile.png");

  // Accessibility settings
  const [accessibility, setAccessibility] = useState({
    highContrast: false,
    fontSize: 16,
  });

  // Fetch profile on mount
  useEffect(() => {
    async function fetchProfile() {
      try {
        const token = localStorage.getItem("token");
        if (!token) return setLoading(false);

        const API = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
        const { data } = await axios.get(`${API}/profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(data);
        setFormData({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          profilePicture: data.profilePicture || "",
        });

        if (data.profilePicture) {
          setPreviewImage(`http://localhost:5000${data.profilePicture}`);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }
  if (!user) return <div className="no-profile">No profile found.</div>;

  // Handlers
  const handleEditToggle = () => {
    setEditing(!editing);
    setChangingPassword(false);
  };
  const handlePasswordToggle = () => {
    setChangingPassword(!changingPassword);
    setEditing(false);
  };
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormData({ ...formData, profilePicture: file });
    const reader = new FileReader();
    reader.onload = (ev) => setPreviewImage(ev.target.result);
    reader.readAsDataURL(file);
  };
  const handlePasswordChange = (e) =>
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const API = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
      const payload = new FormData();
      payload.append("firstName", formData.firstName);
      payload.append("lastName", formData.lastName);
      payload.append("email", formData.email);
      if (typeof formData.profilePicture !== "string") {
        payload.append("profilePicture", formData.profilePicture);
      }

      const { data } = await axios.put(`${API}/profile/update`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(data);
      setEditing(false);
      Swal.fire({
        icon: "success",
        title: "Profile updated",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Update failed",
        text: err.response?.data?.message || "Please try again.",
      });
    }
  };

  const handlePasswordSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const API = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
      await axios.put(`${API}/profile/change-password`, passwordData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChangingPassword(false);
      setPasswordData({ oldPassword: "", newPassword: "" });
      Swal.fire({
        icon: "success",
        title: "Password updated",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Change failed",
        text: err.response?.data?.message || "Please try again.",
      });
    }
  };

  const handleAccessibilityChange = (e) => {
    const { name, type, checked, value } = e.target;
    setAccessibility((a) => ({
      ...a,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <div
      className={`profile-container ${
        accessibility.highContrast ? "high-contrast" : ""
      }`}
      style={{ fontSize: accessibility.fontSize + "px" }}
    >
      <div className="profile-header">
        <h1>My Profile</h1>
        <p>Manage your account settings</p>
      </div>

      <div className="profile-content">
        {/* Profile Card */}
        <div className="profile-card">
          <div className="profile-image-section">
            <div className="image-container">
              <img
                src={previewImage}
                alt="Profile"
                className="profile-img"
              />
              {editing && (
                <label className="upload-btn">
                  <FiUpload />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </label>
              )}
            </div>
            <h2>
              {user.firstName} {user.lastName}
            </h2>
            <p className="user-email">{user.email}</p>
          </div>

          {editing ? (
            // Edit Profile Form
            <div className="edit-section">
              <div className="form-group">
                <label>
                  <FiUser /> First Name
                </label>
                <input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>
                  <FiUser /> Last Name
                </label>
                <input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>
                  <FiMail /> Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div className="action-buttons">
                <button className="btn save-btn" onClick={handleSave}>
                  <FiCheck /> Save
                </button>
                <button
                  className="btn cancel-btn"
                  onClick={() => setEditing(false)}
                >
                  <FiX /> Cancel
                </button>
              </div>
            </div>
          ) : changingPassword ? (
            // Change Password Form
            <div className="password-section">
              <div className="form-group">
                <label>
                  <FiLock /> Current Password
                </label>
                <div className="password-input">
                  <input
                    type={showOldPassword ? "text" : "password"}
                    name="oldPassword"
                    value={passwordData.oldPassword}
                    onChange={handlePasswordChange}
                  />
                  <button
                    className="toggle-password"
                    onClick={() => setShowOldPassword((s) => !s)}
                  >
                    {showOldPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>
                  <FiLock /> New Password
                </label>
                <div className="password-input">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                  />
                  <button
                    className="toggle-password"
                    onClick={() => setShowNewPassword((s) => !s)}
                  >
                    {showNewPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>
              <div className="action-buttons">
                <button
                  className="btn save-btn"
                  onClick={handlePasswordSave}
                >
                  <FiCheck /> Update
                </button>
                <button
                  className="btn cancel-btn"
                  onClick={() => setChangingPassword(false)}
                >
                  <FiX /> Cancel
                </button>
              </div>
            </div>
          ) : (
            // View Profile Details
            <div className="profile-details">
              <div className="detail-item">
                <span className="detail-label">
                  <FiUser /> First Name
                </span>
                <span className="detail-value">{user.firstName}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label"> 
                  <FiUser /> Last Name
                </span>
                <span className="detail-value">{user.lastName}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">
                  <FiMail /> Email
                </span>
                <span className="detail-value">{user.email}</span>
              </div>
              <div className="profile-actions">
                <button className="btn edit-btn" onClick={handleEditToggle}>
                  <FiEdit /> Edit
                </button>
                <button
                  className="btn password-btn"
                  onClick={handlePasswordToggle}
                >
                  <FiLock /> Change PW
                </button>
                <button
                  className="btn forgot-btn"
                  onClick={() => navigate("/profile/forgot-password")}
                >
                  <FiLock /> Forgot PW
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Accessibility Settings */}
        <div className="settings-card">
          <h3>
            <FiUser /> Accessibility
          </h3>
          <div className="settings-option">
            <label>
              <input
                type="checkbox"
                name="highContrast"
                checked={accessibility.highContrast}
                onChange={handleAccessibilityChange}
              />{" "}
              High Contrast
            </label>
          </div>
          <div className="settings-option">
            <label>
              Font Size: {accessibility.fontSize}px
              <input
                type="range"
                name="fontSize"
                min="12"
                max="24"
                value={accessibility.fontSize}
                onChange={handleAccessibilityChange}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
 
// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: { type: String, default: "" },
  lastName:  { type: String, default: "" },
  email:     { type: String, unique: true, required: true },
  password:  { type: String, required: true },

  // Role can now be user, vendor, or admin
  role: {
    type: String,
    enum: ["user", "vendor", "admin"],
    default: "user",
  },

  // For vendors
  businessName: { type: String, default: "" },

  profilePicture: { type: String, default: "" },
  savedPlaces: [{ type: mongoose.Schema.Types.ObjectId, ref: "Place" }],

  // NEW USER PROFILE FIELDS
  phone:   { type: String, default: "" },
  address: { type: String, default: "" },
  bio:     { type: String, default: "" },
  socialLinks: {
    facebook:  { type: String, default: "" },
    twitter:   { type: String, default: "" },
    instagram: { type: String, default: "" },
  },
  notificationSettings: {
    emailNotifications: { type: Boolean, default: true },
  },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);

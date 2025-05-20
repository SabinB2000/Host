const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  userId: { type: mongoose.Types.ObjectId, required: true, unique: true },
  token: { type: String, required: true },
  expires: { type: Date, required: true }
});
module.exports = mongoose.model("PasswordReset", schema);

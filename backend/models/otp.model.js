const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const otpSchema = new Schema({
  email: { type: String, unique: true, required: true },
  otp: { type: String, unique: true, required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  isVerified: { type: Boolean, default: false },
  cooldownUntil: { type: Date },
});

module.exports = mongoose.model("OTP", otpSchema);
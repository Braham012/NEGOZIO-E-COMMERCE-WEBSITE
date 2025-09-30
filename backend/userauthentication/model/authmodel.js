const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: /^[a-zA-Z0-9._%+-]+@gmail\.com$/, // Only allows Gmail addresses
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    otp: {
      type: String, // Stores the OTP for email verification
    },
    otpExpiry: {
      type: Date, // Stores the expiry time for the OTP
    },
    role: {
      type: String,
      enum: ["Customer", "vendor", "admin"],
      default: "Customer",
    },
    verified: {
      type: Boolean,
      default: false, // Indicates whether the email is verified
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema, "UserCredentials");

module.exports = { User };

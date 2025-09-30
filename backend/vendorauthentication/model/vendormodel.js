const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    shopname: {
      type: String,
      required: true,
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
      enum: ["Customer", "vendor"],
      default: "vendor",
    },
    address: {
      currentaddress: {
        type: String,
        required: true,
      },
      pincode: {
        type: Number,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
    },
    verified: {
      type: Boolean,
      default: false,
    },
    resetpassword: {
      type: Boolean, // Stores the reset password
      default: undefined,
    },
  },
  { timestamps: true }
);

const vendor = mongoose.model("Vendor", vendorSchema, "VendorCredentials");
module.exports = { vendor };

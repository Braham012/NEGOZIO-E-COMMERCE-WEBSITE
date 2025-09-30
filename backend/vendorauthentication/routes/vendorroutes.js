const express = require("express");
const {
  registerVendor,
  verifyVendor,
  resendOTP,
  loginVendor,
  forgotpassword,
  verifyForgotPassword,
  resendForgotPasswordOTP,
  resetpassword,
  logoutvendor,
} = require("../controller/vendorcontroller");
const routers = express.Router();

routers.post("/register", registerVendor);
routers.post("/verify", verifyVendor);
routers.post("/resend-otp", resendOTP);
routers.post("/login", loginVendor);
routers.post("/forgot-password", forgotpassword);
routers.post("/verify-forgot-password", verifyForgotPassword);
routers.post("/resend-forgot-password-otp", resendForgotPasswordOTP);
routers.post("/reset-password", resetpassword);
routers.get("/logout", logoutvendor);

module.exports = { routers };

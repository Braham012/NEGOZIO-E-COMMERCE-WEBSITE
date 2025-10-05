const express = require("express");
const { authMiddleware } = require("../middleware//middleware");
const {
  registerUser,
  loginUser,
  verifyOTP,
  resendOTP,
  logoutUser,
} = require("../controller/authcontroller");

const router = express.Router();

router.get("/verify", authMiddleware, (req, res) => {
  res.json({ success: true, user: req.user });
});
router.post("/signup", registerUser);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.post("/login", loginUser);
router.get("/logout", logoutUser);

module.exports = { router };

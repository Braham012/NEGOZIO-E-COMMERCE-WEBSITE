const { vendor } = require("../model/vendormodel");
const { transporter } = require("../../utilis/generateemail");
const bcrypt = require("bcrypt");
const { generateOTP } = require("../../utilis/generateOTP");
const { config } = require("dotenv");
const jwt = require("jsonwebtoken");

config({ path: "./../NODE PROJECT/backend/.env" });
const Key = process.env.SECRET;

async function registerVendor(req, res) {
  try {
    const {
      name,
      shopname,
      email: inputEmail,
      password,
      confirmpassword,
      address,
    } = req.body;
    if (
      !name ||
      !shopname ||
      !inputEmail ||
      !password ||
      !confirmpassword ||
      !address
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const email = inputEmail.trim();
    const existingEmail = await vendor.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }
    if (!email.match(/^[a-zA-Z0-9._%+-]+@gmail\.com$/)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
    if (!name.match(/^[a-zA-Z\s]+$/)) {
      return res.status(400).json({ message: "Name can only contain letters" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }
    if (password !== confirmpassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // OTP valid for 5 minutes
    const newVendor = new vendor({
      name,
      shopname,
      email,
      password: hashedPassword,
      otp,
      otpExpiry,
      address: {
        currentaddress: address.currentaddress,
        pincode: address.pincode,
        city: address.city,
        state: address.state,
      },
    });
    await newVendor.save();
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Email Verification",
      text: `Your OTP for email verification is ${otp}. It is valid for 5 minutes.`,
    };
    await transporter.sendMail(mailOptions);
    res.status(201).json({
      success: true,
      message: "Vendor registered successfully. Please verify your email.",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error registering vendor",
      error: error.message,
    });
  }
}

async function verifyVendor(req, res) {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }
    const vendorData = await vendor.findOne({ email });
    if (!vendorData) {
      return res.status(404).json({ message: "Vendor not found" });
    }
    if (vendorData.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    if (vendorData.otpExpiry < new Date()) {
      return res.status(400).json({ message: "OTP has expired" });
    }
    vendorData.verified = true;
    vendorData.otp = undefined;
    vendorData.otpExpiry = undefined;
    await vendorData.save();

    res.status(200).json({
      success: true,
      message: "Vendor verified successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error verifying vendor",
      error: error.message,
    });
  }
}

async function resendOTP(req, res) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    const vendorData = await vendor.findOne({ email });
    if (!vendorData) {
      return res.status(404).json({ message: "Vendor not found" });
    }
    if (vendorData.verified) {
      return res.status(400).json({ message: "Vendor already verified" });
    }
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // OTP valid for 5 minutes
    vendorData.otp = otp;
    vendorData.otpExpiry = otpExpiry;
    await vendorData.save();

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Resend Email Verification OTP",
      text: `Your new OTP for email verification is ${otp}. It is valid for 5 minutes.`,
    };
    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: "OTP resent successfully. Please check your email.",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error resending OTP",
      error: error.message,
    });
  }
}

async function loginVendor(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
    const vendorData = await vendor.findOne({ email });
    if (!vendorData) {
      return res.status(404).json({ message: "Vendor not found" });
    }
    if (!vendorData.verified) {
      return res.status(400).json({ message: "Vendor not verified" });
    }
    const isMatch = await bcrypt.compare(password, vendorData.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign(
      {
        id: vendorData._id,
        email: vendorData.email,
        shopname: vendorData.shopname,
        role: vendorData.role,
      },
      Key,
      {
        expiresIn: "1D",
      }
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    res.status(200).json({
      success: true,
      message: "Vendor logged in successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error logging in vendor",
      error: error.message,
    });
  }
}

async function forgotpassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    const vendorData = await vendor.findOne({ email });
    if (!vendorData) {
      return res.status(404).json({ message: "Vendor not found" });
    }
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // OTP valid for 5 minutes
    vendorData.otp = otp;
    vendorData.otpExpiry = otpExpiry;
    vendorData.resetpassword = null;
    await vendorData.save();
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Forgot Password Email Verification",
      text: `Your OTP for email verification is ${otp}. It is valid for 5 minutes.`,
    };
    await transporter.sendMail(mailOptions);
    res.status(201).json({
      message: "Check you email for OTP",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error processing forgot password",
      error: error.message,
    });
  }
}

async function verifyForgotPassword(req, res) {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }
    const vendorData = await vendor.findOne({ email });
    if (!vendorData) {
      return res.status(404).json({ message: "Vendor not found" });
    }
    if (vendorData.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    if (vendorData.otpExpiry < new Date()) {
      return res.status(400).json({ message: "OTP has expired" });
    }
    vendorData.resetpassword = true;
    vendorData.otp = undefined;
    vendorData.otpExpiry = undefined;

    await vendorData.save();
    res
      .status(200)
      .json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error verifying OTP for password reset",
      error: error.message,
    });
  }
}
async function resendForgotPasswordOTP(req, res) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    const vendorData = await vendor.findOne({ email });
    if (!vendorData) {
      return res.status(404).json({ message: "Vendor not found" });
    }
    if (!vendorData.resetpassword == null) {
      return res.status(400).json({ message: "Password reset not initiated" });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // OTP valid for 5 minutes
    vendorData.otp = otp;
    vendorData.otpExpiry = otpExpiry;
    await vendorData.save();
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Resend Password Reset OTP",
      text: `Your new OTP for password reset is ${otp}. It is valid for 5 minutes.`,
    };
    await transporter.sendMail(mailOptions);
    res.status(200).json({
      message: "OTP resent successfully. Please check your email.",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error resending OTP for password reset",
      error: error.message,
    });
  }
}

async function resetpassword(req, res) {
  try {
    const { email, newPassword, confirmNewPassword } = req.body;
    if (!newPassword || !confirmNewPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    const vendorData = await vendor.findOne({ email });
    if (!vendorData) {
      return res.status(404).json({ message: "Vendor not found" });
    }
    if (!vendorData.resetpassword == true) {
      return res.status(400).json({ message: "OTP verification Pending" });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    vendorData.password = hashedPassword;
    vendorData.resetpassword = undefined;
    await vendorData.save();
    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error resetting password",
      error: error.message,
    });
  }
}

async function logoutvendor(req, res) {
  try {
    res.clearCookie("token");
    res.status(200).json({
      success: true,
      message: "Logout Successful",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to Logout User", error: error.message });
  }
}

module.exports = {
  registerVendor,
  verifyVendor,
  resendOTP,
  loginVendor,
  forgotpassword,
  verifyForgotPassword,
  resendForgotPasswordOTP,
  resetpassword,
  logoutvendor,
};

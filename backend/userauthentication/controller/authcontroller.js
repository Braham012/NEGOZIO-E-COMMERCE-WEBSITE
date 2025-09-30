const { User } = require("../model/authmodel");
const jwt = require("jsonwebtoken");
const { config } = require("dotenv");
const bcrypt = require("bcrypt");
const { generateOTP } = require("../../utilis/generateOTP");
const { transporter } = require("../../utilis/generateemail");

config({ path: "./../NODE PROJECT/backend/.env" });
const Key = process.env.SECRET;

async function registerUser(req, res) {
  try {
    const {
      name,
      username: inputUsername,
      email: inputEmail,
      password,
      confirmpassword,
      role,
    } = req.body;
    if (
      !name ||
      !inputUsername ||
      !inputEmail ||
      !password ||
      !confirmpassword
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const email = inputEmail.trim();
    const existingemail = await User.findOne({ email });
    if (existingemail) {
      return res.status(400).json({ message: "email already exists" });
    }

    if (!name.match(/^[a-zA-Z\s]+$/)) {
      return res.status(400).json({ message: "Name can only contain letters" });
    }

    if (!email.match(/^[a-zA-Z0-9._%+-]+@gmail\.com$/)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
    const username = inputUsername.trim();
    const existingusername = await User.findOne({ username });
    if (existingusername) {
      return res.status(400).json({ message: "Username already exists" });
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

    const newUser = new User({
      name,
      username,
      email,
      password: hashedPassword,
      otp,
      otpExpiry,
      role,
    });
    await newUser.save();

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "Email Verification",
      text: `Your OTP for email verification is ${otp}. It is valid for 5 minutes.`,
    });

    res.status(201).json({
      success: true,
      message:
        "User registered successfully. Please verify OTP send on your email",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to Register User", error: error.message });
  }
}
async function verifyOTP(req, res) {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    if (user.verified) {
      return res.status(400).json({ message: "User already verified" });
    }
    if (user.otpExpiry < new Date()) {
      return res.status(400).json({ message: "OTP has expired" });
    }
    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    user.verified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;

    await user.save();
    res.status(200).json({
      success: true,
      message: "Email verified successfully . You can now log in",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to verify OTP", error: error.message });
  }
}
async function resendOTP(req, res) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    if (user.verified) {
      return res.status(400).json({ message: "User already verified" });
    }
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // OTP valid for 5 minutes
    user.otp = otp;
    user.otpExpiry = otpExpiry;

    await user.save();

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "Resend OTP for Email Verification",
      text: `Your new OTP for email verification is ${otp}. It is valid for 5 minutes.`,
    });
    res.json({
      success: true,
      message: "OTP resent successfully. Please check your email.",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to resend OTP", error: error.message });
  }
}

async function loginUser(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
    const existinguser = await User.findOne({ email });
    if (!existinguser) {
      return res.status(400).json({
        message: "User not Found, Please Register First",
      });
    }
    const isPasswordValid = await bcrypt.compare(
      password,
      existinguser.password
    );
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid Credentails" });
    }
    if (!existinguser.verified) {
      return res.status(400).json({
        message: "Email not verified. Please verify your email first.",
      });
    }

    const token = jwt.sign(
      {
        id: existinguser._id,
        name: existinguser.name,
        email: existinguser.email,
        role: existinguser.role,
      },
      Key,
      { expiresIn: "1D" }
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // Set to true if using HTTPS
      maxAge: 1000 * 60 * 60 * 24 * 2,
      sameSite: "lax",
      path: "/", // 👈 ensure cookie is available across routes
      domain: "localhost",
    });

    res.status(200).json({
      success: true,
      message: " Thanku for Logging in ",
      user: {
        name: existinguser.name,
        email: existinguser.email,
        role: existinguser.role,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to Login User", error: error.message });
  }
}
async function logoutUser(req, res) {
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

async function forgetpassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const otp = generateOTP();
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to process request", error: error.message });
  }
}
module.exports = {
  registerUser,
  loginUser,
  verifyOTP,
  resendOTP,
  logoutUser,
};

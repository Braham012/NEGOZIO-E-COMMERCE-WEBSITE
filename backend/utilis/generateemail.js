const nodemailer = require("nodemailer");
const { config } = require("dotenv");
config({ path: "./../NODE PROJECT/backend/.env" });

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL, // Your email address
    pass: process.env.PASSWORD, // Your email password or app password
  },
});

module.exports = { transporter };

const nodemailer = require("nodemailer");
const { config } = require("dotenv");
config({ path: "./../NODE PROJECT/backend/.env" });

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

module.exports = { transporter };

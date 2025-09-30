const { config } = require("dotenv");
const mongoose = require("mongoose");

config({ path: "./../NODE PROJECT/backend/.env" });
const url = process.env.URL;

async function connectdb() {
  try {
    await mongoose.connect(url);
    console.log("Database Connected :)");
  } catch (error) {
    console.log("Error Connecting to Database", error);
  }
}

module.exports = { connectdb };

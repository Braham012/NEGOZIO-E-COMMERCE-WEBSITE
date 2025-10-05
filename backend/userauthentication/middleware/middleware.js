const jwt = require("jsonwebtoken");
const config = require("dotenv");
config.config({ path: "./../NODE PROJECT/backend/.env" });

const Key = process.env.SECRET;

const authMiddleware = (req, res, next) => {
  const token = req.cookies.token; // read from cookie

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "No token, unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, Key);
    req.user = decoded; // store user info in req.user
    next(); // continue to the route
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

module.exports = { authMiddleware };

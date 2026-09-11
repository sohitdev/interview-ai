const jwt = require("jsonwebtoken");
const tokenBlacklistModel = require("../models/blacklist.model");

async function authUser(req, res, next) {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: " No token found. User is not logged in",
        status: "error",
      });
    }

    const isblacklistedToken = await tokenBlacklistModel.findOne({ token });

    if (isblacklistedToken) {
      return res.status(401).json({
        message: "Token is invalid. Please log in again.",
        status: "error",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
      status: "error",
    });
  }
}

module.exports = { authUser };

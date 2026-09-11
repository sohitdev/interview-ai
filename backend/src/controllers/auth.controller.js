const userModel = require("../models/user.model");
const tokenBlacklistModel = require("../models/blacklist.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

/**
 * @description: Register a new user
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} - The response object
 */

async function registerUserController(req, res) {
  try {
    const { username, email, password } = req.body;

    // Validate the request body
    if (!username || !email || !password) {
      return res.status(400).json({
        message: "Username, email, or password are required",
        status: "error",
      });
    }

    // Check if the user already exists
    const isUserAlreadyExists = await userModel.findOne({
      $or: [{ username }, { email }],
    });

    if (isUserAlreadyExists) {
      return res.status(400).json({
        message: "User with this username or email already exists",
        status: "error",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Create a new user
    const user = await userModel.create({
      username,
      email,
      password: passwordHash,
    });

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      {
        expiresIn: "3d",
      },
    );

    res.cookie("token", token);

    return res.status(201).json({
      message: "User created successfully",
      status: "success",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
      status: "error",
    });
  }
}

/**
 * @description: Login a user
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} - The response object
 */
async function loginUserController(req, res) {
  try {
    const { email, password } = req.body;

    // Validate the request body
    if (!email || !password) {
      return res.status(400).json({
        message: "Email or password are required",
        status: "error",
      });
    }

    // Check if the user exists
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User with this email does not exist",
        status: "failed",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({
        message: "Invalid email or password",
        status: "failed",
      });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      {
        expiresIn: "3d",
      },
    );

    res.cookie("token", token);

    return res.status(200).json({
      message: "User logged-in successfully",
      status: "success",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
      status: "error",
    });
  }
}

/**
 * @description: Logout a user
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} - The response object
 * @access Public
 */
async function logoutUserController(req, res) {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(400).json({
        message: " No token found. User is not logged in",
        status: "error",
      });
    }

    await tokenBlacklistModel.create({ token });
    res.clearCookie("token");
    return res.status(200).json({
      message: "User logged out successfully",
      status: "success",
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
      status: "error",
    });
  }
}

/**
 * @description: Get the currently logged-in user's information
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} - The response object
 * @access private
 */
async function getMeController(req, res) {
  try {
    const user = await userModel.findById(req.user.id);
    return res.status(200).json({
      message: "User information retrieved successfully",
      status: "success",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
      status: "error",
    });
  }
}

module.exports = {
  registerUserController,
  loginUserController,
  logoutUserController,
  getMeController,
};

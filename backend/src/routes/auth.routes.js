const express = require("express");
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

/**
 * @route POST /api/auth/register
 * @description: Register a new user, expects username, email, and password in the request body,
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} - The response object
 * @access Public
 */
router.post("/register", authController.registerUserController);

/**
 * @route POST /api/auth/login
 * @description: Login a user,expects username and password in the request body,
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} - The response object
 * @access Public
 */
router.post("/login", authController.loginUserController);

/**
 * @route GET /api/auth/logout
 * @description: Logout a user, expects a valid JWT token in the request cookies,
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} - The response object
 * @access Public
 */
router.get("/logout", authController.logoutUserController);

/**
 * @route GET /api/auth/get-me
 * @description: Get the currently logged-in user's information, expects a valid JWT token in the request cookies,
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} - The response object
 * @access Private
 */
router.get("/get-me", authMiddleware.authUser, authController.getMeController);

module.exports = router;

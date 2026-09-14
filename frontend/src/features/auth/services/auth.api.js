import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
});

/**
 * Registers a new user
 * @param {Object} param0 - The user's information
 * @param {string} param0.username - The user's username
 * @param {string} param0.email - The user's email
 * @param {string} param0.password - The user's password
 * @returns {Promise<Object>} A promise that resolves to the registered user's data
 */
export async function registerUser({ username, email, password }) {
  try {
    const response = await api.post("/api/auth/register", {
      username,
      email,
      password,
    });

    return response.data;
  } catch (error) {
    console.log(error);
  }
}

/**
 * Logs in a user
 * @param {Object} param0 - The user's login information
 * @param {string} param0.email - The user's email
 * @param {string} param0.password - The user's password
 * @returns {Promise<Object>} A promise that resolves to the logged-in user's data
 */

export async function loginUser({ email, password }) {
  try {
    const response = await api.post("/api/auth/login", {
      email,
      password,
    });

    return response.data;
  } catch (error) {
    console.log(error);
  }
}

/**
 * Logs out the current user
 * @returns {Promise<void>} A promise that resolves when the user is logged out
 */

export async function logoutUser() {
  try {
    await api.get("/api/auth/logout");
  } catch (error) {
    console.log(error);
  }
}

/**
 * Gets the current user
 * @returns {Promise<Object>} A promise that resolves to the current user's data
 */
export async function getCurrentUser() {
  try {
    const response = await api.get("/api/auth/get-me");
    return response.data;
  } catch (error) {
    console.log(error);
  }
}

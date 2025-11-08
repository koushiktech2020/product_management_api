import express from "express";
import {
  registerController,
  loginController,
  logoutController,
  logoutFromAllDevicesController,
  getProfileController,
  updateProfileController,
  changePasswordController,
} from "../controllers/index.js";
import {
  authenticateToken,
  authLimiter,
  loginLimiter,
} from "../middleware/index.js";

const router = express.Router();

// Public routes with rate limiting
router.post("/register", authLimiter, registerController);
router.post("/login", loginLimiter, loginController);

// Protected routes (require authentication)
router.post("/logout", authenticateToken, logoutController);
router.post("/logout-all", authenticateToken, logoutFromAllDevicesController);
router.get("/profile", authenticateToken, getProfileController);
router.put("/profile", authenticateToken, updateProfileController);
router.put("/change-password", authenticateToken, changePasswordController);

export default router;

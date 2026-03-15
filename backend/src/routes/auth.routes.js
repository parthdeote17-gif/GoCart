import express from "express";
import {
  sendOTP,
  verifyOTP,
  register,
  login,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/send-otp", sendOTP);   // OTP bhejne ke liye
router.post("/verify-otp", verifyOTP); // (Optional) Verify check karne ke liye
router.post("/register", register);  // Register (Ab Name bhi accept karega)
router.post("/login", login);        // Login (Ab User Name return karega)

export default router;
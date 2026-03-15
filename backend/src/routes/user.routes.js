import express from "express";
import { authenticateToken } from "../middleware/auth.middleware.js"; // Ensure middleware exists
import { 
  getProfile, 
  updateProfile, 
  saveAddress, 
  getAddresses, 
  deleteAccount,
  // ✅ NEW IMPORTS: Controller functions add kiye
  updateAddress,
  deleteAddress
} from "../controllers/auth.controller.js";

const router = express.Router();

router.get("/profile", authenticateToken, getProfile);
router.put("/profile", authenticateToken, updateProfile); // Phone update ab isme handled hai

router.post("/address", authenticateToken, saveAddress);
router.get("/address", authenticateToken, getAddresses);

// ✅ NEW ROUTES: Edit aur Delete ke liye
router.put("/address/:id", authenticateToken, updateAddress);   // Edit Address
router.delete("/address/:id", authenticateToken, deleteAddress); // Delete Address

router.delete("/account", authenticateToken, deleteAccount); // Delete Account

export default router;
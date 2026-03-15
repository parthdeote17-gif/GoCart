import express from "express";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { getWishlist, toggleWishlist } from "../controllers/wishlist.controller.js";

const router = express.Router();

router.get("/", authenticateToken, getWishlist);          // Get all items
router.post("/toggle", authenticateToken, toggleWishlist); // Add/Remove

export default router;
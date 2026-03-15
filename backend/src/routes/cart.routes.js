import express from "express";
import { authenticateToken } from "../middleware/auth.middleware.js"; // <--- FIXED IMPORT
import { 
  getCart, 
  addToCart, 
  removeFromCart, 
  updateQuantity 
} from "../controllers/cart.controller.js";

const router = express.Router();

router.get("/", authenticateToken, getCart);          // <--- Updated Middleware
router.post("/", authenticateToken, addToCart);       // <--- Updated Middleware
router.put("/:id", authenticateToken, updateQuantity); // <--- Updated Middleware
router.delete("/:id", authenticateToken, removeFromCart); // <--- Updated Middleware

export default router;
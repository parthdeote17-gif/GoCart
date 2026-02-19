import express from "express";
import { authenticateToken } from "../middleware/auth.middleware.js"; // <--- FIXED IMPORT
import { 
  addReview, 
  getReviews, 
  editReview,   
  deleteReview  
} from "../controllers/review.controller.js";

const router = express.Router();

router.post("/", authenticateToken, addReview); // <--- Updated Middleware
router.get("/:id", getReviews); 

// Edit & Delete Routes
router.put("/:reviewId", authenticateToken, editReview);    // <--- Updated Middleware
router.delete("/:reviewId", authenticateToken, deleteReview); // <--- Updated Middleware

export default router;
import express from "express";
import { 
  listProducts, 
  productDetail, 
  getCategories,
  getRelatedProducts, // ✅ Import Add Kiya
  getSearchSuggestions, // ✅ Naya Import: Search Suggestions ke liye
  getRecommendedForUser // ✅ Naya Import: ML Recommendations ke liye
} from "../controllers/product.controller.js";

import { authenticateToken } from "../middleware/auth.middleware.js"; // ✅ Auth middleware import kiya

const router = express.Router();

// 1. Specific static routes (Sabse pehle)
router.get("/categories", getCategories); 
router.get("/suggestions", getSearchSuggestions); // ✅ Naya Route: Suggestions API
router.get("/recommendations", authenticateToken, getRecommendedForUser); // ✅ Naya Route: ML Recommendations

// 2. Specific sub-resource routes (Generic :id se pehle rakhna safe hai)
router.get("/:id/related", getRelatedProducts); // ✅ Naya Route

// 3. Root route
router.get("/", listProducts);            

// 4. Generic ID route (Sabse last mein, taaki ye upar walon ko block na kare)
router.get("/:id", productDetail);        

export default router;
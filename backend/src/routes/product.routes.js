import express from "express";
import { 
  listProducts, 
  productDetail, 
  getCategories,
  getRelatedProducts, // ✅ Import Add Kiya
  getSearchSuggestions // ✅ Naya Import: Search Suggestions ke liye
} from "../controllers/product.controller.js";

const router = express.Router();

// 1. Specific static routes (Sabse pehle)
router.get("/categories", getCategories); 
router.get("/suggestions", getSearchSuggestions); // ✅ Naya Route: Suggestions API

// 2. Specific sub-resource routes (Generic :id se pehle rakhna safe hai)
router.get("/:id/related", getRelatedProducts); // ✅ Naya Route

// 3. Root route
router.get("/", listProducts);            

// 4. Generic ID route (Sabse last mein, taaki ye upar walon ko block na kare)
router.get("/:id", productDetail);        

export default router;

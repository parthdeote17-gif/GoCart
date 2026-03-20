import pool from "../config/db.js"; // ✅ DB connection
import jwt from "jsonwebtoken"; // 🌟 For manual token decoding

import { 
  getAllProducts, 
  countProducts, 
  getProductById, 
  getAllCategories,
  getRelatedProductsModel,
  getSearchSuggestionsModel 
} from "../models/product.model.js";

import { logInteraction } from "../utils/interaction.logger.js";

export const listProducts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const category = req.query.category || "All";
  const search = req.query.search || ""; 
  
  const random = req.query.random === 'true'; 

  const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice) : null;
  const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice) : null;

  const offset = (page - 1) * limit;

  try {
    const products = await getAllProducts(limit, offset, category, search, random, minPrice, maxPrice); 
    const totalItems = await countProducts(category, search, minPrice, maxPrice); 
    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      products,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        itemsPerPage: limit
      }
    });
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getSearchSuggestions = async (req, res) => {
  try {
    const search = req.query.q || "";
    if (search.length < 2) return res.json({ categories: [], products: [] }); 
    
    const suggestions = await getSearchSuggestionsModel(search);
    res.json(suggestions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await getAllCategories();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==========================================
// 🌟 Product Detail (Smart Token Check)
// ==========================================
export const productDetail = async (req, res) => {
  try {
    const { id } = req.params;
    if (isNaN(id)) return res.status(400).json({ message: "Invalid Product ID" });

    const product = await getProductById(id);
    
    if (!product) return res.status(404).json({message: "Not found"});

    console.log("👉 Product Page opened! ID:", id);

    let userId = req.user?.id; 

    if (!userId && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            const token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            userId = decoded.id;
        } catch (error) {
            console.log("⚠️ Token decode failed.");
        }
    }

    if (userId) {
        console.log("👉 Logging interaction for user:", userId);
        await logInteraction(userId, id, 'VIEW', 1);
    } 
    
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getRelatedProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const related = await getRelatedProductsModel(id);
    res.json(related);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==========================================
// 🌟 Recommended For User (Dual-Environment Support)
// ==========================================
export const getRecommendedForUser = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Uses ENV variable on Render, defaults to localhost:8000 for local dev
        const pythonUrl = process.env.PYTHON_ML_SERVICE_URL || "http://127.0.0.1:8000";
        
        console.log(`👉 Calling ML Service at: ${pythonUrl}/recommend/${userId}`);

        const pyResponse = await fetch(`${pythonUrl}/recommend/${userId}`);
        
        // Safe check if Python service is down
        if (!pyResponse.ok) {
            console.warn("⚠️ Python service unreachable or returned error.");
            return res.json([]); 
        }

        const data = await pyResponse.json();
        const productIds = data.recommended_product_ids || [];

        if (productIds.length === 0) {
             console.log("👉 3. WARNING: Python sent an empty list!");
             return res.json([]); 
        }

        const query = `SELECT * FROM products WHERE id = ANY($1::int[])`;
        const result = await pool.query(query, [productIds]);
        
        console.log("👉 4. Products found in database:", result.rows.length);

        res.json(result.rows);
    } catch (err) {
        console.error("❌ ML Engine Error:", err.message);
        // Fail-safe: sending empty array to prevent UI crash
        res.status(200).json([]); 
    }
};
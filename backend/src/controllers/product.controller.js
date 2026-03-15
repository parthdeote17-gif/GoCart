import pool from "../config/db.js"; // ✅ DB connection import kiya recommendations fetch karne ke liye
import jwt from "jsonwebtoken"; // 🌟 NAYA IMPORT: Token decode karne ke liye

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
// 🌟 UPDATED: Product Detail (With Smart Token Check)
// ==========================================
export const productDetail = async (req, res) => {
  try {
    const { id } = req.params;
    if (isNaN(id)) return res.status(400).json({ message: "Invalid Product ID" });

    const product = await getProductById(id);
    
    if (!product) return res.status(404).json({message: "Not found"});

    console.log("👉 Product Page khula! ID:", id);

    // 🌟 THE FIX: Manually Check Token for Public Routes
    let userId = req.user?.id; // Agar router se mila toh thik hai

    // Agar req.user nahi hai, par frontend ne header me token bheja hai
    if (!userId && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            const token = req.headers.authorization.split(' ')[1];
            // Token ko decode karke user id nikalo
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            userId = decoded.id;
        } catch (error) {
            console.log("⚠️ Token decode nahi ho paya (shayad expire ho gaya hai).");
        }
    }

    // ✅ Ab agar userId mil gaya, toh interaction log kar do
    if (userId) {
        console.log("👉 Database me entry ja rahi hai user ke liye:", userId);
        await logInteraction(userId, id, 'VIEW', 1);
    } else {
        console.log("⚠️ ERROR: User ka token nahi mila, isliye database me record nahi hua.");
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

export const getRecommendedForUser = async (req, res) => {
    try {
        const userId = req.user.id;
        console.log("👉 1. Node.js asking Python for User ID:", userId);
        
        const pyResponse = await fetch(`http://127.0.0.1:8000/recommend/${userId}`);
        const data = await pyResponse.json();
        
        console.log("👉 2. Python ne yeh IDs bheji:", data);

        const productIds = data.recommended_product_ids;

        if (!productIds || productIds.length === 0) {
             console.log("👉 3. WARNING: Python ne khali list bheji!");
             return res.json([]); 
        }

        const query = `SELECT * FROM products WHERE id = ANY($1::int[])`;
        const result = await pool.query(query, [productIds]);
        
        console.log("👉 4. Database se itne products mile:", result.rows.length);

        res.json(result.rows);
    } catch (err) {
        console.error("❌ ML Engine Error:", err.message);
        res.status(500).json({ message: "Unable to fetch recommendations" });
    }
};
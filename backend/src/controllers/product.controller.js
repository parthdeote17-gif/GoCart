import { 
  getAllProducts, 
  countProducts, 
  getProductById, 
  getAllCategories,
  getRelatedProductsModel,
  getSearchSuggestionsModel // ✅ Naya Import Add Kiya
} from "../models/product.model.js";

export const listProducts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const category = req.query.category || "All";
  const search = req.query.search || ""; 
  
  // ✅ Frontend se 'random=true' bhejne par ye capture hoga
  const random = req.query.random === 'true'; 

  // ✅ NEW: Frontend se aane wale min aur max price variables
  const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice) : null;
  const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice) : null;

  const offset = (page - 1) * limit;

  try {
    // ✅ Model me minPrice aur maxPrice pass kiye
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

// ✅ NEW: Search Suggestions Controller
export const getSearchSuggestions = async (req, res) => {
  try {
    const search = req.query.q || "";
    // Agar search term 2 character se chota hai, to query fire mat karo, empty list return karo
    if (search.length < 2) return res.json([]); 
    
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

export const productDetail = async (req, res) => {
  try {
    const { id } = req.params;
    if (isNaN(id)) return res.status(400).json({ message: "Invalid Product ID" });

    const product = await getProductById(id);
    
    if (!product) return res.status(404).json({message: "Not found"});
    
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

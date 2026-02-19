import pool from "../config/db.js";

// ✅ Updated: Added 'random' parameter
export const getAllProducts = async (limit, offset, category, search, random = false) => {
  let query = "SELECT * FROM products WHERE 1=1"; 
  let params = [];
  
  // 1. Category Filter
  if (category && category !== "All") {
    params.push(category);
    query += ` AND category_name = $${params.length}`;
  }

  // 2. Search Filter
  if (search && search.trim() !== "") {
    params.push(`%${search}%`);
    query += ` AND (title ILIKE $${params.length} OR description ILIKE $${params.length} OR category_name ILIKE $${params.length})`;
  }

  // 3. Sorting Logic (Random vs ID)
  // Agar 'random' true hai aur search nahi ho raha, toh random dikhao
  if (random && (!search || search.trim() === "")) {
    query += ` ORDER BY RANDOM()`;
  } else {
    query += ` ORDER BY id ASC`;
  }

  // 4. Pagination
  params.push(limit);
  const limitIndex = params.length;
  
  params.push(offset);
  const offsetIndex = params.length;
  
  query += ` LIMIT $${limitIndex} OFFSET $${offsetIndex}`;

  const { rows } = await pool.query(query, params);
  return rows;
};

export const countProducts = async (category, search) => {
  let query = "SELECT COUNT(*) FROM products WHERE 1=1";
  let params = [];

  if (category && category !== "All") {
    params.push(category);
    query += ` AND category_name = $${params.length}`;
  }

  if (search && search.trim() !== "") {
    params.push(`%${search}%`);
    query += ` AND (title ILIKE $${params.length} OR description ILIKE $${params.length} OR category_name ILIKE $${params.length})`;
  }

  const { rows } = await pool.query(query, params);
  return parseInt(rows[0].count);
};

export const getProductById = async (id) => {
  const { rows } = await pool.query("SELECT * FROM products WHERE id = $1", [id]);
  return rows[0];
};

export const getAllCategories = async () => {
  const { rows } = await pool.query(
    "SELECT category_name, COUNT(*) as count FROM products WHERE category_name IS NOT NULL GROUP BY category_name"
  );
  return rows;
};

// Related Products logic
export const getRelatedProductsModel = async (id, limit = 4) => {
  const query = `
    SELECT * FROM products 
    WHERE category_name = (SELECT category_name FROM products WHERE id = $1) 
    AND id != $1 
    ORDER BY RANDOM() 
    LIMIT $2
  `;
  const { rows } = await pool.query(query, [id, limit]);
  return rows;
};
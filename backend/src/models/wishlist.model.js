import pool from "../config/db.js";

export const getWishlistItems = async (userId) => {
  const { rows } = await pool.query(
    `SELECT w.product_id, p.id, p.title, p.price, p.img_url, p.category_name
     FROM wishlist w
     JOIN products p ON w.product_id = p.id
     WHERE w.user_id = $1
     ORDER BY w.created_at DESC`,
    [userId]
  );
  return rows;
};

export const checkWishlistItem = async (userId, productId) => {
  const { rows } = await pool.query(
    "SELECT 1 FROM wishlist WHERE user_id = $1 AND product_id = $2",
    [userId, productId]
  );
  return rows.length > 0;
};

export const toggleWishlistItem = async (userId, productId) => {
  // Check karo agar pehle se hai
  const exists = await checkWishlistItem(userId, productId);

  if (exists) {
    // Agar hai to remove karo
    await pool.query(
      "DELETE FROM wishlist WHERE user_id = $1 AND product_id = $2",
      [userId, productId]
    );
    return { added: false, message: "Removed from Wishlist" };
  } else {
    // Agar nahi hai to add karo
    await pool.query(
      "INSERT INTO wishlist (user_id, product_id) VALUES ($1, $2)",
      [userId, productId]
    );
    return { added: true, message: "Added to Wishlist" };
  }
};
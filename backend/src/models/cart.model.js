import pool from "../config/db.js";

export const getCartItems = async (userId) => {
  const { rows } = await pool.query(
    `SELECT c.id, c.product_id, c.quantity, p.title, p.price, p.img_url 
     FROM cart_items c 
     JOIN products p ON c.product_id = p.id 
     WHERE c.user_id = $1 
     ORDER BY c.id ASC`, // Order fix kiya taaki items idhar udhar na bhagein
    [userId]
  );
  return rows;
};

export const findCartItem = async (userId, productId) => {
  const { rows } = await pool.query(
    "SELECT * FROM cart_items WHERE user_id = $1 AND product_id = $2",
    [userId, productId]
  );
  return rows[0];
};

// UPDATED: Ab ye specific quantity set karega (increment nahi)
export const updateCartQuantity = async (userId, productId, quantity) => {
  if (quantity <= 0) {
    // Agar quantity 0 ya kam hai, to item uda do
    await pool.query(
      "DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2",
      [userId, productId]
    );
  } else {
    // Warna quantity update karo
    await pool.query(
      "UPDATE cart_items SET quantity = $3 WHERE user_id = $1 AND product_id = $2",
      [userId, productId, quantity]
    );
  }
};

export const addCartItem = async (userId, productId) => {
  await pool.query(
    "INSERT INTO cart_items (user_id, product_id, quantity) VALUES ($1, $2, 1)",
    [userId, productId]
  );
};

export const removeCartItem = async (userId, productId) => {
  await pool.query(
    "DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2",
    [userId, productId]
  );
};

export const clearCart = async (client, userId) => {
  await client.query("DELETE FROM cart_items WHERE user_id = $1", [userId]);
};
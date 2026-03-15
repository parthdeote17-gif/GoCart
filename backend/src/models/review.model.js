import pool from "../config/db.js";

export const insertReview = async (userId, productId, rating, comment) => {
  await pool.query(
    "INSERT INTO reviews (user_id, product_id, rating, comment) VALUES ($1, $2, $3, $4)",
    [userId, productId, rating, comment]
  );
};

// UPDATED: Ab ye First Name aur Last Name bhi layega
export const fetchReviewsByProduct = async (productId) => {
  const { rows } = await pool.query(
    `SELECT r.*, u.first_name, u.last_name, u.email
     FROM reviews r
     JOIN users u ON u.id = r.user_id
     WHERE product_id = $1
     ORDER BY r.created_at DESC`, // Latest review pehle dikhe
    [productId]
  );
  return rows;
};

// NEW: Delete Review Query
export const deleteReviewModel = async (reviewId, userId) => {
  await pool.query(
    "DELETE FROM reviews WHERE id = $1 AND user_id = $2",
    [reviewId, userId]
  );
};

// NEW: Edit Review Query
export const updateReviewModel = async (reviewId, userId, rating, comment) => {
  await pool.query(
    "UPDATE reviews SET rating = $3, comment = $4 WHERE id = $1 AND user_id = $2",
    [reviewId, userId, rating, comment]
  );
};
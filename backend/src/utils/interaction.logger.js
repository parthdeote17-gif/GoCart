import pool from "../config/db.js";

export const logInteraction = async (userId, productId, type, weight) => {
  // Agar user logged in nahi hai ya product id nahi hai, to kuch mat karo
  if (!userId || !productId) return; 
  
  try {
    const query = `
      INSERT INTO user_interactions (user_id, product_id, interaction_type, weight)
      VALUES ($1, $2, $3, $4)
    `;
    await pool.query(query, [userId, productId, type, weight]);
  } catch (err) {
    console.error("Interaction logging error:", err.message);
  }
};
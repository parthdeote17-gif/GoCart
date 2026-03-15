import pool from "../config/db.js";

// Transaction ke liye 'client' pass kar rahe hain
export const getCartForOrder = async (client, userId) => {
  const { rows } = await client.query(
    "SELECT c.*, p.price FROM cart_items c JOIN products p ON c.product_id = p.id WHERE user_id = $1",
    [userId]
  );
  return rows;
};

// UPDATED: Ab Address ID bhi save hogi
export const createOrder = async (client, userId, totalAmount, addressId) => {
  const { rows } = await client.query(
    "INSERT INTO orders (user_id, total_amount, address_id, status) VALUES ($1, $2, $3, 'PLACED') RETURNING id",
    [userId, totalAmount, addressId]
  );
  return rows[0].id;
};

export const addOrderItem = async (client, orderId, productId, price, quantity) => {
  await client.query(
    "INSERT INTO order_items (order_id, product_id, price, quantity) VALUES ($1, $2, $3, $4)",
    [orderId, productId, price, quantity]
  );
};

// UPDATED: Ab Address details (Name, City) bhi fetch hongi
export const fetchUserOrders = async (userId) => {
  const { rows } = await pool.query(
    `SELECT 
        o.id as order_id, o.total_amount, o.status, o.created_at,
        a.full_name as shipping_name, a.city as shipping_city, 
        oi.product_id, oi.quantity, oi.price,
        p.title, p.img_url 
     FROM orders o
     LEFT JOIN addresses a ON o.address_id = a.id
     JOIN order_items oi ON o.id = oi.order_id
     JOIN products p ON oi.product_id = p.id
     WHERE o.user_id = $1 
     ORDER BY o.created_at DESC`,
    [userId]
  );
  return rows;
};
import pool from "../config/db.js";
import { 
  getCartForOrder, 
  createOrder, 
  addOrderItem, 
  fetchUserOrders 
} from "../models/order.model.js";
import { clearCart } from "../models/cart.model.js";

export const placeOrder = async (req, res) => {
  const { addressId } = req.body; // UPDATED: Frontend se Address ID aani chahiye
  
  if (!addressId) {
    return res.status(400).json({ message: "Delivery address is required" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const userId = req.user.id;

    // 1. Get Cart Items
    const cartItems = await getCartForOrder(client, userId);
    if (cartItems.length === 0) throw new Error("Cart is empty");

    // 2. Calculate Total
    const total = cartItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

    // 3. Create Order (UPDATED: Address ID pass kiya)
    const orderId = await createOrder(client, userId, total, addressId);

    // 4. Move items
    for (const item of cartItems) {
      await addOrderItem(client, orderId, item.product_id, item.price, item.quantity);
    }

    // 5. Clear Cart
    await clearCart(client, userId);

    await client.query("COMMIT");
    res.json({ message: "Order placed successfully", orderId });

  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

export const getOrders = async (req, res) => {
  try {
    const rows = await fetchUserOrders(req.user.id);

    const ordersMap = {};
    rows.forEach((row) => {
      if (!ordersMap[row.order_id]) {
        ordersMap[row.order_id] = {
          id: row.order_id,
          total_amount: row.total_amount,
          status: row.status,
          created_at: row.created_at,
          // UPDATED: Shipping Info Add kiya
          shipping: { 
            name: row.shipping_name || "Unknown", 
            city: row.shipping_city || "Unknown" 
          },
          items: [] 
        };
      }
      ordersMap[row.order_id].items.push({
        product_id: row.product_id,
        title: row.title,
        img_url: row.img_url, 
        quantity: row.quantity,
        price: row.price
      });
    });

    res.json(Object.values(ordersMap));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
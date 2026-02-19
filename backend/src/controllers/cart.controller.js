import { 
  getCartItems, 
  findCartItem, 
  updateCartQuantity, 
  addCartItem, 
  removeCartItem 
} from "../models/cart.model.js";

// Get Cart
export const getCart = async (req, res) => {
  try {
    const items = await getCartItems(req.user.id);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add to Cart (Logic Updated for new Model)
export const addToCart = async (req, res) => {
  const { productId } = req.body;
  const userId = req.user.id;

  try {
    const existing = await findCartItem(userId, productId);

    if (existing) {
      // Agar pehle se hai, to purani quantity + 1 karke update karo
      await updateCartQuantity(userId, productId, existing.quantity + 1);
    } else {
      // Naya item daalo
      await addCartItem(userId, productId);
    }
    res.json({ message: "Added to cart" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// NEW: Update Quantity (Frontend se direct number aayega)
export const updateQuantity = async (req, res) => {
  const { quantity } = req.body; // e.g. 5
  const productId = req.params.id; // product_id URL se
  
  try {
    await updateCartQuantity(req.user.id, productId, quantity);
    res.json({ message: "Quantity updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Remove Item
export const removeFromCart = async (req, res) => {
  try {
    await removeCartItem(req.user.id, req.params.id);
    res.json({ message: "Removed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
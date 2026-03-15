import { getWishlistItems, toggleWishlistItem } from "../models/wishlist.model.js";

// ✅ NEW: Import interaction logger for ML recommendation
import { logInteraction } from "../utils/interaction.logger.js";

export const getWishlist = async (req, res) => {
  try {
    const items = await getWishlistItems(req.user.id);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const toggleWishlist = async (req, res) => {
  const { productId } = req.body;
  try {
    const result = await toggleWishlistItem(req.user.id, productId);
    
    // ✅ NEW: Log Wishlist Interaction (Weight: 2)
    // Jab bhi user wishlist mein item toggle karega, ML engine ke liye save ho jayega
    await logInteraction(req.user.id, productId, 'WISHLIST', 2);

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
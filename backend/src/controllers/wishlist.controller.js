import { getWishlistItems, toggleWishlistItem } from "../models/wishlist.model.js";

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
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
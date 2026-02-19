import { 
  insertReview, 
  fetchReviewsByProduct, 
  deleteReviewModel, 
  updateReviewModel 
} from "../models/review.model.js";

export const addReview = async (req, res) => {
  const { product_id, rating, comment } = req.body;
  try {
    await insertReview(req.user.id, product_id, rating, comment);
    res.json({ message: "Review added" });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
};

export const getReviews = async (req, res) => {
  try {
    const reviews = await fetchReviewsByProduct(req.params.id);
    
    // Name Formatting: Agar naam hai to wo dikhao, nahi to "Amazon Customer"
    const formattedReviews = reviews.map(r => ({
      ...r,
      user_name: r.first_name ? `${r.first_name} ${r.last_name || ''}` : 'Amazon Customer'
    }));

    res.json(formattedReviews);
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
};

// NEW: Delete Review Controller
export const deleteReview = async (req, res) => {
  try {
    await deleteReviewModel(req.params.reviewId, req.user.id);
    res.json({ message: "Review deleted" });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
};

// NEW: Edit Review Controller
export const editReview = async (req, res) => {
  const { rating, comment } = req.body;
  try {
    await updateReviewModel(req.params.reviewId, req.user.id, rating, comment);
    res.json({ message: "Review updated" });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
};
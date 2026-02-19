import { apiFetch } from "./api";

export interface Review {
  id: number;
  user_id: number; // Ownership check ke liye
  user_name?: string;  
  user_email?: string; 
  rating: number;
  comment: string;
  created_at?: string;
}

/**
 * Fetch reviews for a specific product.
 */
export async function getReviews(productId: number | string): Promise<Review[]> {
  try {
    if (!productId) {
      return [];
    }
    const data = await apiFetch(`/reviews/${productId}`);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error(`Error fetching reviews for product ${productId}:`, error);
    return []; 
  }
}

/**
 * Add a new review.
 */
export async function addReview(
  productId: number | string,
  rating: number,
  comment: string
) {
  try {
    if (!productId) throw new Error("Invalid Product ID");
    if (rating < 1 || rating > 5) throw new Error("Rating must be between 1 and 5");
    if (!comment || comment.trim() === "") throw new Error("Comment cannot be empty");

    return await apiFetch("/reviews", {
      method: "POST",
      body: JSON.stringify({ 
        product_id: productId, 
        rating, 
        comment 
      }),
    });
  } catch (error) {
    console.error("Error adding review:", error);
    throw error; 
  }
}

// ✅ NEW: Delete Review Helper
export async function deleteReviewService(reviewId: number) {
  return await apiFetch(`/reviews/${reviewId}`, {
    method: "DELETE",
  });
}

// ✅ NEW: Edit Review Helper
export async function editReviewService(reviewId: number, rating: number, comment: string) {
  return await apiFetch(`/reviews/${reviewId}`, {
    method: "PUT",
    body: JSON.stringify({ rating, comment }),
  });
}
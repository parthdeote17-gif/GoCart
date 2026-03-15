import { apiFetch } from "./api";

export async function getWishlist() {
  return await apiFetch("/wishlist");
}

export async function toggleWishlist(productId: number) {
  return await apiFetch("/wishlist/toggle", {
    method: "POST",
    body: JSON.stringify({ productId }),
  });
}
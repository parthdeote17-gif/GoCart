import { apiFetch } from "./api"; // Imported the updated api.ts configuration

export async function getCart() {
  // apiFetch automatically handles the authentication token, ngrok header, and the correct API base URL
  return apiFetch("/cart", { 
    cache: 'no-store' // Data fresh rakhne ke liye
  });
}

export async function addToCart(productId: number) {
  return apiFetch("/cart", {
    method: "POST",
    body: JSON.stringify({ productId }),
  });
}

export async function removeFromCart(productId: number) {
  return apiFetch(`/cart/${productId}`, {
    method: "DELETE",
  });
}

// --- NEW FUNCTION: Update Quantity ---
export async function updateQuantity(productId: number, quantity: number) {
  return apiFetch(`/cart/${productId}`, {
    method: "PUT",
    body: JSON.stringify({ quantity }),
  });
}

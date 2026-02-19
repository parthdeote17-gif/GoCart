import { apiFetch } from "./api"; // ✅ Humne jo api.ts fix kiya tha, usko import kiya

export async function getCart() {
  // apiFetch khud Token, Ngrok Header aur sahi URL laga lega
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
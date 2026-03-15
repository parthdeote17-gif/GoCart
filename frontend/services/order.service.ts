import { apiFetch } from "./api";

export interface Order {
  id: string;
  total_amount: string;
  status: string;
  created_at: string;
  shipping: {
    name: string;
    city: string;
  };
  items: any[];
}

export async function getOrders() {
  return await apiFetch("/orders");
}

// NEW: Checkout page isko call karega Address ID ke saath
export async function placeOrder(addressId: number) {
  return await apiFetch("/orders", {
    method: "POST",
    body: JSON.stringify({ addressId }),
  });
}
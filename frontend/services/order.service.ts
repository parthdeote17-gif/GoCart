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

// New: This will be called by the Checkout page with the Address ID
export async function placeOrder(addressId: number) {
  return await apiFetch("/orders", {
    method: "POST",
    body: JSON.stringify({ addressId }),
  });
}

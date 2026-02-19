"use client";

import { removeFromCart } from "@/services/cart.service";

export default function CartItem({ item, reload }: any) {
  return (
    <div className="flex justify-between border-b py-2">
      <span>{item.title}</span>
      <div>
        ₹{item.price}
        <button
          onClick={() => removeFromCart(item.product_id).then(reload)}
          className="ml-2 text-red-600 text-xs"
        >
          Remove
        </button>
      </div>
    </div>
  );
}

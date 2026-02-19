"use client";

import { useEffect, useState } from "react";
import { getCart, removeFromCart } from "@/services/cart.service"; 
import Link from "next/link"; 
import { useRouter } from "next/navigation";
import { apiFetch } from "@/services/api";
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, ShieldCheck, CreditCard, ShoppingBag } from "lucide-react";

export default function CartPage() {
  const [items, setItems] = useState<any[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Auth State
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadCart = () => getCart().then(setItems);

  useEffect(() => { 
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      loadCart().finally(() => setLoading(false));
    } else {
      setIsLoggedIn(false);
      setLoading(false);
    }
  }, []);

  const total = items.reduce((s, i) => s + Number(i.price) * i.quantity, 0);

  // --- Quantity Update Logic ---
  const updateQty = async (productId: number, newQty: number) => {
    if (newQty < 1) return;
    try {
      await apiFetch(`/cart/${productId}`, {
        method: "PUT",
        body: JSON.stringify({ quantity: newQty })
      });
      loadCart();
    } catch (err) { console.error("Failed to update qty"); }
  };

  async function handleRemove(id: number) {
    await removeFromCart(id);
    loadCart();
  }

  async function handleCheckout() {
    try {
      router.push("/checkout");
    } catch (err) {
      alert("Checkout failed");
    }
  }

  // --- Background Blobs Component ---
  const BackgroundBlobs = () => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-[10%] left-[-10%] w-[400px] h-[400px] bg-cyan-400/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "2s" }}></div>
    </div>
  );

  // --- 1. NOT LOGGED IN STATE ---
  if (!loading && !isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
         <BackgroundBlobs />
         <div className="max-w-md w-full bg-white/80 backdrop-blur-xl border border-white/60 p-10 rounded-[2.5rem] shadow-xl text-center">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-600">
                <ShoppingBag size={40} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-4">Your Cart is feeling lonely</h1>
            <p className="text-slate-500 mb-8 leading-relaxed">Sign in to see items you may have added previously or start a new collection.</p>
            
            <div className="space-y-3">
              <Link href="/login" className="block">
                <button className="w-full bg-slate-900 text-white hover:bg-slate-800 py-3 rounded-xl font-bold shadow-lg shadow-slate-900/20 transition-all">
                  Sign In
                </button>
              </Link>
              {/* ✅ CHANGE: '/home' -> '/' */}
              <Link href="/" className="block">
                <button className="w-full bg-white text-slate-900 border-2 border-slate-100 hover:border-slate-300 py-3 rounded-xl font-bold transition-all">
                  Continue Shopping
                </button>
              </Link>
            </div>
         </div>
      </div>
    );
  }

  // --- 2. LOGGED IN BUT EMPTY CART ---
  if (!loading && items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8 flex justify-center items-center relative overflow-hidden">
        <BackgroundBlobs />
        <div className="max-w-3xl w-full bg-white/80 backdrop-blur-xl border border-white/60 p-12 rounded-[2.5rem] shadow-xl flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6 text-indigo-600">
             <ShoppingCart size={48} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-3">Your Cart is empty</h1>
          <p className="text-slate-500 mb-8 max-w-md">Looks like you haven't added anything to your cart yet. Explore our products and find something you love.</p>
          {/* ✅ CHANGE: '/home' -> '/' */}
          <Link href="/">
             <button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-8 py-3 font-bold shadow-lg shadow-indigo-500/30 transition-all flex items-center gap-2">
               Start Shopping <ArrowRight size={18} />
             </button>
          </Link>
        </div>
      </div>
    );
  }

  // --- 3. FILLED CART UI ---
  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-20 relative overflow-x-hidden font-sans">
      <BackgroundBlobs />
      
      <div className="max-w-7xl mx-auto pt-24">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-8 px-2">Shopping Cart <span className="text-slate-400 font-medium text-xl ml-2">({items.length} items)</span></h1>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left: Cart Items */}
          <div className="flex-1 space-y-4">
             {items.map((item) => (
               <div key={item.id} className="bg-white/80 backdrop-blur-sm p-6 rounded-[2rem] shadow-sm border border-white hover:shadow-md transition-all flex gap-6 items-center">
                 
                 {/* Product Image */}
                 <Link href={`/product/${item.product_id}`} className="w-28 h-28 flex-shrink-0 bg-white rounded-xl border border-slate-100 p-2 flex items-center justify-center">
                    <img src={item.img_url || "https://via.placeholder.com/150"} alt={item.title} className="w-full h-full object-contain mix-blend-multiply" />
                 </Link>

                 {/* Details */}
                 <div className="flex-1 min-w-0">
                   <div className="flex justify-between items-start">
                      <Link href={`/product/${item.product_id}`} className="text-lg font-bold text-slate-900 hover:text-indigo-600 transition-colors line-clamp-2 pr-4">
                        {item.title}
                      </Link>
                      <button 
                        onClick={() => handleRemove(item.product_id)} 
                        className="text-slate-300 hover:text-red-500 transition-colors p-1"
                        title="Remove Item"
                      >
                        <Trash2 size={20} />
                      </button>
                   </div>
                   
                   <p className="text-sm text-green-600 font-bold mt-1 mb-4">In Stock</p>
                   
                   <div className="flex items-center justify-between">
                      {/* Quantity Controls */}
                      <div className="flex items-center bg-slate-100 rounded-full p-1">
                          <button 
                            className="w-8 h-8 flex items-center justify-center bg-white rounded-full text-slate-600 shadow-sm hover:text-indigo-600 disabled:opacity-50" 
                            onClick={() => updateQty(item.product_id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-10 text-center font-bold text-slate-900 text-sm">{item.quantity}</span>
                          <button 
                            className="w-8 h-8 flex items-center justify-center bg-white rounded-full text-slate-600 shadow-sm hover:text-indigo-600" 
                            onClick={() => updateQty(item.product_id, item.quantity + 1)}
                          >
                            <Plus size={14} />
                          </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <span className="block text-xs text-slate-400">Total</span>
                        <span className="text-xl font-bold text-slate-900">₹{Number(item.price) * item.quantity}</span>
                      </div>
                   </div>
                 </div>
               </div>
             ))}
          </div>

          {/* Right: Checkout Summary */}
          <div className="lg:w-96 h-fit sticky top-24">
             <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[2rem] shadow-xl border border-white/50">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                   <div className="flex justify-between text-slate-500">
                     <span>Subtotal</span>
                     <span>₹{total}</span>
                   </div>
                   <div className="flex justify-between text-slate-500">
                     <span>Shipping</span>
                     <span className="text-green-600 font-medium">Free</span>
                   </div>
                   <div className="h-px bg-slate-100 my-2"></div>
                   <div className="flex justify-between text-slate-900 text-xl font-extrabold">
                     <span>Total</span>
                     <span>₹{total}</span>
                   </div>
                </div>

                <button 
                  onClick={handleCheckout}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-4 font-bold shadow-lg shadow-indigo-500/30 transition-all transform active:scale-95 flex items-center justify-center gap-2"
                >
                  Proceed to Checkout <ArrowRight size={20} />
                </button>

                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
                   <ShieldCheck size={14} /> Secure Transaction
                </div>
                <div className="mt-2 flex justify-center gap-2 opacity-50">
                    <CreditCard size={20} />
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
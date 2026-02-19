"use client";

import { useEffect, useState } from "react";
import { getWishlist, toggleWishlist } from "@/services/wishlist.service"; // toggleWishlist import kiya remove ke liye
import { addToCart } from "@/services/cart.service"; // addToCart import kiya
import Link from "next/link";
import { Heart, ArrowRight, User, Trash2, ShoppingCart, Star, AlertCircle, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";

export default function WishlistPage() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      loadWishlist();
    } else {
      setIsLoggedIn(false);
      setLoading(false);
    }
  }, []);

  const loadWishlist = () => {
    getWishlist()
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  // ✅ Remove Logic (UI + API)
  const handleRemove = async (productId: number) => {
    try {
      await toggleWishlist(productId);
      setItems((prev) => prev.filter((item) => (item.id || item.product_id) !== productId));
    } catch (error) {
      alert("Failed to remove item");
    }
  };

  // ✅ Add to Cart Logic
  const handleAddToCart = async (productId: number) => {
    try {
      await addToCart(productId);
      router.push("/cart");
    } catch (error) {
      alert("Please login first");
    }
  };

  const BackgroundBlobs = () => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-red-400/20 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-[10%] right-[-10%] w-[400px] h-[400px] bg-pink-400/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "2s" }}></div>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600"></div>
    </div>
  );

  // 1. Not Logged In
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
         <BackgroundBlobs />
         <div className="max-w-md w-full bg-white/80 backdrop-blur-xl border border-white/60 p-10 rounded-[2.5rem] shadow-xl text-center">
             <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                <User size={40} />
             </div>
             <h2 className="text-2xl font-bold text-slate-900 mb-2">Login to see your Wishlist</h2>
             <Link href="/login" className="block mb-4">
               <button className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-3 font-bold shadow-lg mt-4">
                 Sign In
               </button>
             </Link>
         </div>
      </div>
    );
  }

  // 2. Empty State
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
        <BackgroundBlobs />
        <div className="max-w-xl w-full bg-white/80 backdrop-blur-xl border border-white/60 p-12 rounded-[2.5rem] shadow-xl flex flex-col items-center text-center">
           <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6 text-red-500">
              <Heart size={48} fill="currentColor" />
           </div>
           <h1 className="text-3xl font-bold text-slate-900 mb-3">Your Wishlist is empty</h1>
           {/* ✅ CHANGE: '/home' -> '/' */}
           <Link href="/">
             <button className="bg-slate-900 text-white rounded-xl px-8 py-3 font-bold shadow-lg mt-4 flex items-center gap-2">
               Start Shopping <ArrowRight size={18} />
             </button>
           </Link>
        </div>
      </div>
    );
  }

  // 3. Filled Wishlist (LIST VIEW)
  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900 py-10 pt-28">
      <BackgroundBlobs />
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-red-100 text-red-600 rounded-2xl">
            <ShoppingBag size={28} />
          </div>
          <h1 className="text-3xl font-black text-slate-900">My Wishlist <span className="text-slate-400 font-medium text-xl ml-2">({items.length})</span></h1>
        </div>

        <div className="space-y-6">
            {items.map((item) => {
              const productId = item.id || item.product_id;
              const imageSrc = item.img_url || item.imgUrl || "https://via.placeholder.com/300";

              return (
                // ✅ Horizontal Card Container
                <div 
                  key={productId} 
                  className="group bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden"
                >
                  
                  {/* 1. PRODUCT IMAGE (Left Side) */}
                  <div className="relative w-full md:w-48 aspect-square bg-slate-50 rounded-2xl flex-shrink-0 flex items-center justify-center p-4">
                    <Link href={`/product/${productId}`} className="w-full h-full flex items-center justify-center">
                      <img 
                        src={imageSrc} 
                        alt={item.title} 
                        className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500" 
                      />
                    </Link>
                  </div>

                  {/* 2. PRODUCT DETAILS (Middle) */}
                  <div className="flex-1 text-center md:text-left space-y-3 w-full">
                    
                    {/* Category & Rating */}
                    <div className="flex items-center justify-center md:justify-start gap-3">
                       <span className="bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                         {item.category_name || "Product"}
                       </span>
                       <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-2 py-0.5 rounded-md">
                         <Star size={12} fill="currentColor" />
                         <span className="text-xs font-bold">4.5</span>
                       </div>
                    </div>

                    {/* Title */}
                    <Link href={`/product/${productId}`}>
                      <h3 className="text-xl font-bold text-slate-900 hover:text-indigo-600 transition-colors line-clamp-2">
                        {item.title}
                      </h3>
                    </Link>

                    {/* Price */}
                    <div className="flex items-center justify-center md:justify-start gap-3">
                      <span className="text-2xl font-black text-slate-900">₹{item.price}</span>
                      <span className="text-sm text-slate-400 line-through font-medium">₹{Math.round(Number(item.price) * 1.3)}</span>
                      <span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded-lg">20% OFF</span>
                    </div>

                    {/* Description (Optional) */}
                    <p className="text-slate-500 text-sm line-clamp-2 hidden md:block">
                      {item.description || "No description available for this product. Check details page for more info."}
                    </p>
                  </div>

                  {/* 3. ACTIONS (Right Side) */}
                  <div className="flex flex-row md:flex-col gap-3 w-full md:w-auto flex-shrink-0">
                    
                    <button 
                      onClick={() => handleAddToCart(productId)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-indigo-600 transition-all shadow-lg hover:shadow-indigo-500/30 active:scale-95 whitespace-nowrap"
                    >
                      <ShoppingCart size={18} /> Add to Cart
                    </button>

                    <button 
                      onClick={() => handleRemove(productId)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all active:scale-95 whitespace-nowrap"
                    >
                      <Trash2 size={18} /> Remove
                    </button>

                  </div>

                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
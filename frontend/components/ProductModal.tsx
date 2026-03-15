"use client";

import { X, ShoppingCart, Star, Check } from "lucide-react";
import { addToCart } from "@/services/cart.service";
import { useState } from "react";

type Props = {
  product: any;
  onClose: () => void;
};

export default function ProductModal({ product, onClose }: Props) {
  const [adding, setAdding] = useState(false);

  if (!product) return null;

  const handleAddToCart = async () => {
    setAdding(true);
    await addToCart(product.id);
    setTimeout(() => setAdding(false), 1000); // 1 sec feedback
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Modal Container */}
      <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-300 flex flex-col md:flex-row">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors shadow-sm"
        >
          <X size={20} />
        </button>

        {/* Left: Image Section */}
        <div className="w-full md:w-1/2 bg-slate-50 p-8 flex items-center justify-center">
          <img 
            src={product.img_url || product.imgUrl || "https://via.placeholder.com/300"} 
            alt={product.title}
            className="max-h-[300px] object-contain mix-blend-multiply drop-shadow-xl"
          />
        </div>

        {/* Right: Details Section */}
        <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-center">
           
           <div className="mb-4">
             <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                {product.category_name || "Product"}
             </span>
           </div>

           <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4 leading-tight">
             {product.title}
           </h2>

           <div className="flex items-center gap-2 mb-6">
              <div className="flex text-yellow-400">
                 {[...Array(5)].map((_, i) => (
                   <Star key={i} size={16} fill={i < 4 ? "currentColor" : "none"} />
                 ))}
              </div>
              <span className="text-sm text-slate-400 font-medium">(4.5 Reviews)</span>
           </div>

           <p className="text-slate-500 leading-relaxed mb-8 line-clamp-4">
             {product.description || "No description available for this premium product. It features high-quality materials and excellent craftsmanship."}
           </p>

           <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between">
              <div>
                 <p className="text-sm text-slate-400 line-through font-medium">
                   ₹{product.list_price || Math.round(product.price * 1.3)}
                 </p>
                 <p className="text-3xl font-extrabold text-slate-900">
                   ₹{product.price}
                 </p>
              </div>

              <button 
                onClick={handleAddToCart}
                disabled={adding}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg ${
                  adding 
                    ? "bg-green-500 text-white shadow-green-500/30" 
                    : "bg-slate-900 text-white hover:bg-indigo-600 hover:shadow-indigo-500/30 active:scale-95"
                }`}
              >
                {adding ? (
                  <> <Check size={20} /> Added </>
                ) : (
                  <> <ShoppingCart size={20} /> Add to Cart </>
                )}
              </button>
           </div>

        </div>

      </div>
    </div>
  );
}
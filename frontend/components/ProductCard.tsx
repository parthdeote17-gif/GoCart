"use client";

import Link from "next/link";
import { addToCart } from "@/services/cart.service";
import { toggleWishlist } from "@/services/wishlist.service";
import { ShoppingCart, Heart, MoreVertical, Star, Trash2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

export default function ProductCard({ 
  product, 
  initialLiked = false, 
  onRemove 
}: { 
  product: any, 
  initialLiked?: boolean,
  onRemove?: (id: number) => void 
}) {

  if (!product) return null;

  /* ✅ ROBUST DATASET IMAGE EXTRACTION */
  let imageSrc = "";

  if (product?.images && Array.isArray(product.images) && product.images.length > 0) {
    imageSrc = product.images[0];
  } else if (product?.image) {
    imageSrc = product.image;
  } else if (product?.thumbnail) {
    imageSrc = product.thumbnail;
  } else if (product?.img_url) {
    imageSrc = product.img_url;
  } else if (product?.imgUrl) {
    imageSrc = product.imgUrl;
  }

  /* ✅ Agar relative path hai to full URL banao */
  if (imageSrc && !imageSrc.startsWith("http")) {
    imageSrc = `${BASE_URL}${imageSrc}`;
  }

  const [liked, setLiked] = useState(initialLiked);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: any) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (liked && onRemove) {
        onRemove(product.id || product.product_id);
    }
    setLiked(!liked);
    setShowMenu(false);
    try {
      await toggleWishlist(product.id || product.product_id);
    } catch (err) {
      console.error(err);
      setLiked((prev) => !prev);
      alert("Please login to use Wishlist");
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product.id || product.product_id);
  };

  return (
    <div className="group relative aspect-[4/5] bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:border-slate-200 transition-all duration-300">
      
      {/* IMAGE AREA */}
      <div className="absolute inset-0 p-5 pb-24 flex items-center justify-center bg-white z-0">
        <Link
          href={`/product/${product.id || product.product_id}`}
          className="w-full h-full flex items-center justify-center relative"
        >
          {imageSrc && (
            <img
              src={imageSrc}
              alt={product.title}
              referrerPolicy="no-referrer" /* ✅ FIX for Amazon/External Hotlink blocks */
              className="relative z-10 h-full w-full object-contain hover:scale-110 transition-transform duration-500 mix-blend-multiply"
              onError={(e) => {
                // ✅ No Placeholders - Sirf image hide hogi jaisa aapne kaha tha
                e.currentTarget.style.display = "none";
              }}
            />
          )}
        </Link>
      </div>

      {/* THREE DOTS MENU */}
      <div className="absolute top-3 right-3 z-30" ref={menuRef}>
        <button
          onClick={toggleMenu}
          className={`w-9 h-9 rounded-full flex items-center justify-center shadow-sm border transition-colors ${
            showMenu 
              ? "bg-slate-900 border-slate-900 text-white" 
              : "bg-white/90 border-slate-100 text-slate-500 hover:bg-slate-50 hover:text-indigo-600 backdrop-blur-sm"
          }`}
          type="button"
        >
          <MoreVertical size={16} />
        </button>

        {showMenu && (
          <div className="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden z-40 transform origin-top-right transition-all">
            <button
              onClick={handleWishlist}
              className={`w-full text-left px-4 py-3.5 text-sm font-bold flex items-center gap-3 transition-colors ${
                liked 
                ? "text-red-500 hover:bg-red-50" 
                : "text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
              }`}
              type="button"
            >
              {liked ? (
                <>
                  <Trash2 size={16} /> Remove
                </>
              ) : (
                <>
                  <Heart size={16} /> Wishlist
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* INFO LAYER */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none">
        <div className="bg-gradient-to-t from-white via-white/95 to-transparent pt-12 pb-4 px-5">
          
          <div className="flex items-center justify-between mb-1">
            <span className="text-slate-400 text-[11px] font-extrabold uppercase tracking-wider line-clamp-1 pr-2">
              {product.category_name || "General"}
            </span>
            <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded-md">
               <Star size={10} fill="currentColor" />
               <span className="text-[11px] font-bold text-amber-700">4.5</span>
            </div>
          </div>

          <Link
            href={`/product/${product.id || product.product_id}`}
            className="block pointer-events-auto"
          >
            <h3 className="font-bold text-slate-800 text-[15px] leading-tight line-clamp-1 mb-1.5 group-hover:text-indigo-600 transition-colors">
              {product.title}
            </h3>
          </Link>

          <div className="flex items-center justify-between mt-1 pointer-events-auto">
            <div className="flex flex-col">
               <div className="flex items-baseline gap-2">
                 <span className="text-[17px] font-extrabold text-slate-900">
                   ₹{product.price}
                 </span>
                 {product.price && (
                   <span className="text-[12px] text-slate-400 line-through font-semibold">
                     ₹{Math.round(Number(product.price) * 1.3)}
                   </span>
                 )}
               </div>
            </div>

            <button
              onClick={handleAddToCart}
              className="h-9 w-9 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-md hover:bg-indigo-600 hover:shadow-indigo-600/20 hover:-translate-y-0.5 transition-all"
              title="Add to Cart"
              type="button"
            >
              <ShoppingCart size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

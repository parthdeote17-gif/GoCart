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

  // ✅ ADDED TRY CATCH FOR ADD TO CART ERROR HANDLING
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await addToCart(product.id || product.product_id);
      // alert("Item added to cart!"); // Uncomment if you want success message too
    } catch (err) {
      console.error(err);
      alert("Please login to add items to your cart");
    }
  };

  return (
    <div className="group relative aspect-[4/5] bg-white rounded-[1.5rem] overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
      
      {/* IMAGE AREA */}
      <div className="absolute inset-0 p-4 pb-24 flex items-center justify-center bg-white z-0">
        <Link
          href={`/product/${product.id || product.product_id}`}
          className="w-full h-full flex items-center justify-center relative"
        >
          {imageSrc && (
            <img
              src={imageSrc}
              alt={product.title}
              referrerPolicy="no-referrer"
              className="relative z-10 h-full w-full object-contain hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                // Agar image load fail ho jaye to hide kar do (no placeholder)
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
          className={`w-9 h-9 rounded-full flex items-center justify-center shadow-sm border border-slate-100 ${
            showMenu 
              ? "bg-slate-900 text-white" 
              : "bg-white/90 backdrop-blur-sm text-slate-500 hover:bg-slate-50 hover:text-indigo-600"
          }`}
          type="button"
        >
          <MoreVertical size={16} />
        </button>

        {showMenu && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-40">
            <button
              onClick={handleWishlist}
              className={`w-full text-left px-4 py-3 text-sm font-semibold flex items-center gap-3 ${
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
        <div className="bg-gradient-to-t from-white via-white/80 to-transparent pt-10 pb-4 px-4">
          
          <div className="flex items-center justify-between mb-1">
            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">
              {product.category_name}
            </span>
            <div className="flex items-center gap-1 text-amber-500">
               <Star size={12} fill="currentColor" />
               <span className="text-xs font-bold text-slate-700">4.5</span>
            </div>
          </div>

          <Link
            href={`/product/${product.id || product.product_id}`}
            className="block pointer-events-auto"
          >
            <h3 className="font-bold text-slate-900 text-base leading-tight line-clamp-1 mb-1">
              {product.title}
            </h3>
          </Link>

          <div className="flex items-center justify-between mt-1 pointer-events-auto">
            <div className="flex flex-col">
               <div className="flex items-center gap-2">
                 <span className="text-lg font-bold text-slate-900">
                   ₹{product.price}
                 </span>
                 <span className="text-xs text-slate-400 line-through font-medium">
                   ₹{Math.round(Number(product.price) * 1.3)}
                 </span>
               </div>
            </div>

            <button
              onClick={handleAddToCart}
              className="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-md hover:bg-indigo-600 transition-colors"
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

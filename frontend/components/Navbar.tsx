"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react"; 
import { ShoppingBag, Search, ShoppingCart, User, LogOut, Heart, Menu, X, ArrowRight, Sparkles } from "lucide-react"; 
import { getCart } from "@/services/cart.service";
import { fetchSearchSuggestions } from "@/services/product.service"; 

export default function Navbar() {
  // ---------------------------------------------------------
  // ✅ LOGIC SECTION (Unchanged Core Logic)
  // ---------------------------------------------------------
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [cartCount, setCartCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ NEW States for Suggestions (Categories + Products Object)
  const [suggestions, setSuggestions] = useState<any>({ categories: [], products: [] });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    // Check for window to avoid hydration mismatch
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
    const userStr = typeof window !== 'undefined' ? localStorage.getItem("user") : null;
    
    if (token && userStr) {
      setUser(JSON.parse(userStr));
      // Cart count update
      getCart()
        .then(items => setCartCount(items.length))
        .catch(() => setCartCount(0));
    }
  }, []);

  // Fetch search suggestions as the user types using debouncing
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.trim().length >= 2) {
        fetchSearchSuggestions(searchTerm).then((data: any) => {
          // Backend ab { categories: [...], products: [...] } return kar raha hai
          setSuggestions(data);
          setShowSuggestions(true);
        });
      } else {
        setSuggestions({ categories: [], products: [] });
        setShowSuggestions(false);
      }
    }, 300); // 300ms delay taaki har letter type karne pe API call na ho

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Close the dropdown when clicking outside of it
  useEffect(() => {
    function handleClickOutside(event: any) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/login");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false); // Close the dropdown after clicking the search button
    if (searchTerm.trim()) {
      router.push(`/?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      router.push(`/`);
    }
  };

  // ---------------------------------------------------------
  // ✅ UI SECTION (Original Navbar + Premium Search Bar)
  // ---------------------------------------------------------
  return (
    // ✨ Glassmorphism Container with Soft Shadow (Original Style)
    <nav className="fixed top-0 left-0 right-0 z-50 bg-purple-50/80 backdrop-blur-md border-b border-indigo-100/50 transition-all duration-300 shadow-sm shadow-indigo-100/20">
      <div className="max-w-[1500px] mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* 1. BRANDING & LOGO (Original) */}
        <div className="flex items-center gap-12 shrink-0">
          <Link href="/" className="flex items-center gap-2.5 group cursor-pointer">
            {/* Logo Icon with Gradient & Rotation */}
            <div className="w-10 h-10 bg-gradient-to-br from-slate-900 to-indigo-900 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:rotate-6 transition-transform duration-300">
              <ShoppingBag size={20} className="stroke-[2.5]" />
            </div>
            {/* Text with Gradient */}
            <span className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-indigo-800 to-violet-700">
              gocart<span className="text-indigo-600">.</span>
            </span>
          </Link>

          {/* Desktop Nav Links with Hover Underline */}
          <div className="hidden lg:flex items-center gap-8 text-sm font-bold text-slate-500">
            {[
              { name: 'Home', path: '/' },
              { name: 'About', path: '/about' },
              { name: 'Contact', path: '/about' } 
            ].map((link) => (
              <Link 
                key={link.name}
                href={link.path} 
                className="relative hover:text-indigo-700 transition-colors py-1 group/link"
              >
                {link.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 transition-all duration-300 group-hover/link:w-full rounded-full"></span>
              </Link>
            ))}
          </div>
        </div>

        {/* 2. ✅ NEW PREMIUM SEARCH BAR (Minimalist & Sleek) */}
        <form ref={searchRef} onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl mx-8 relative z-50 group">
          <div className="relative w-full flex items-center bg-white/60 hover:bg-white border border-indigo-100 focus-within:bg-white focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-500/10 rounded-full transition-all duration-300 px-2 py-1.5 shadow-sm hover:shadow-md">
            
            <Search size={18} className="text-slate-400 ml-3 shrink-0 group-focus-within:text-indigo-500 transition-colors" />
            
            <input 
              type="text"
              placeholder="Search products, brands and more..."
              className="flex-1 bg-transparent border-none outline-none px-4 py-2 text-sm font-semibold text-slate-800 placeholder:text-slate-400/80"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => { if((suggestions.categories?.length > 0) || (suggestions.products?.length > 0)) setShowSuggestions(true) }}
            />

            {/* Clear Button */}
            {searchTerm && (
              <button type="button" onClick={() => setSearchTerm("")} className="mr-2 p-1.5 text-slate-400 hover:text-rose-500 transition-colors rounded-full hover:bg-rose-50">
                <X size={16} className="stroke-[2.5]" />
              </button>
            )}

            {/* Stylish Submit Button Inside Input */}
            <button type="submit" className="bg-gradient-to-r from-slate-900 to-indigo-900 text-white p-2 rounded-full shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all">
              <ArrowRight size={18} className="stroke-[2.5]" />
            </button>
            
            {/* ✅ PREMIUM SUGGESTIONS DROPDOWN */}
            {showSuggestions && (suggestions.categories?.length > 0 || suggestions.products?.length > 0) && (
              <div className="absolute top-[120%] left-0 right-0 bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] border border-indigo-50 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-4">
                
                {/* --- CATEGORIES SECTION (Modern Tags) --- */}
                {suggestions.categories?.length > 0 && (
                  <div className="p-4 border-b border-indigo-50 bg-slate-50/50">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                      <Sparkles size={12} className="text-amber-500" /> Suggested Categories
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.categories.map((cat: any, idx: number) => (
                        <button 
                          key={idx}
                          type="button"
                          onClick={() => { 
                            setSearchTerm("");
                            setShowSuggestions(false); 
                            router.push(`/?category=${encodeURIComponent(cat.category_name)}`);
                          }}
                          className="px-4 py-2 bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-sm hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all font-bold text-slate-600 text-[13px] flex items-center gap-2"
                        >
                          {cat.category_name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* --- PRODUCTS SECTION --- */}
                {suggestions.products?.length > 0 && (
                  <div className="p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-3 pt-2">Products</p>
                    <div className="flex flex-col gap-1">
                      {suggestions.products.map((item: any) => (
                        <Link 
                          key={item.id} 
                          href={`/product/${item.id}`}
                          onClick={() => { 
                              setShowSuggestions(false); 
                              setSearchTerm(""); 
                          }}
                          className="flex items-center gap-4 px-3 py-3 hover:bg-indigo-50/50 rounded-2xl transition-all cursor-pointer group border border-transparent hover:border-indigo-50"
                        >
                          <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 p-1.5 shrink-0 flex items-center justify-center overflow-hidden shadow-sm group-hover:scale-105 transition-transform duration-300">
                            <img src={item.img_url} alt={item.title} className="w-full h-full object-contain mix-blend-multiply" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-[14px] font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">{item.title}</h4>
                            <p className="text-[13px] text-indigo-600 font-bold mt-0.5">₹{item.price}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        </form>

        {/* 3. ACTIONS & PROFILE (Original + Go AI Button) */}
        <div className="flex items-center gap-5 shrink-0">
          
          {/* ✨ NAYA GO AI BUTTON YAHAN ADD HUA HAI */}
          <Link href="/ai" className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-full font-bold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 transition-all active:scale-95">
            <Sparkles size={16} />
            <span>Go AI</span>
          </Link>

          <div className="flex items-center gap-1">
            {/* Wishlist Icon */}
            <Link href="/wishlist" className="p-2.5 text-slate-600 hover:text-rose-600 transition-all hover:bg-rose-50 rounded-full active:scale-90 duration-200">
              <Heart size={22} className="stroke-[2]" />
            </Link>

            {/* Cart with Counter */}
            <Link href="/cart" className="relative p-2.5 text-slate-600 hover:text-indigo-600 transition-all group hover:bg-indigo-50 rounded-full active:scale-90 duration-200 mr-2">
              <ShoppingCart size={22} className="stroke-[2]" />
              {cartCount > 0 && (
                <div className="absolute top-1.5 right-1 w-5 h-5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white shadow-sm transform group-hover:scale-110 transition-transform">
                  {cartCount}
                </div>
              )}
            </Link>
          </div>

          <div className="h-8 w-px bg-indigo-200/60 hidden sm:block"></div>

          {/* User Section */}
          {user ? (
            <div className="flex items-center gap-3 pl-2">
              <Link href="/profile" className="flex items-center gap-3 group p-1.5 pr-4 rounded-full bg-white/50 hover:bg-white border border-transparent hover:border-indigo-100 transition-all shadow-sm active:scale-95">
                <div className="w-8 h-8 bg-gradient-to-tr from-indigo-100 to-purple-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-xs border border-indigo-200/50 group-hover:rotate-12 transition-transform">
                  {user.first_name ? user.first_name[0].toUpperCase() : <User size={14}/>}
                </div>
                <span className="text-sm font-bold text-slate-700 max-w-[80px] truncate hidden xl:block group-hover:text-indigo-700 transition-colors">
                  {user.first_name}
                </span>
              </Link>
              
              <button 
                onClick={handleLogout}
                className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all border border-transparent hover:border-red-100 active:scale-90"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link href="/login">
              {/* Stylish Gradient Button */}
              <button className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-slate-900 to-indigo-900 text-white rounded-full font-bold hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5 transition-all text-sm active:scale-95 duration-200">
                <User size={18} />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            </Link>
          )}

          {/* Mobile Menu Icon */}
          <button className="lg:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-full transition-colors active:scale-90">
            <Menu size={24} />
          </button>
        </div>
      </div>
    </nav>
  );
}

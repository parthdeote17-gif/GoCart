"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react"; // ✅ useRef add kiya
import { ShoppingBag, Search, ShoppingCart, User, LogOut, Heart, Menu } from "lucide-react"; 
import { getCart } from "@/services/cart.service";
import { fetchSearchSuggestions } from "@/services/product.service"; // ✅ Import kiya

export default function Navbar() {
  // ---------------------------------------------------------
  // ✅ LOGIC SECTION (Unchanged)
  // ---------------------------------------------------------
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [cartCount, setCartCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ NEW States for Suggestions
  const [suggestions, setSuggestions] = useState<any[]>([]);
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

  // ✅ NEW: Fetch Suggestions jab type kare (Debounce ke sath)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.trim().length >= 2) {
        fetchSearchSuggestions(searchTerm).then(data => {
          setSuggestions(data);
          setShowSuggestions(true);
        });
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300); // 300ms delay taaki har letter type karne pe API call na ho

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // ✅ NEW: Bahar click karne par dropdown band ho jaye
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
    setShowSuggestions(false); // ✅ Search pe click karne k baad dropdown band
    if (searchTerm.trim()) {
      router.push(`/?search=${encodeURIComponent(searchTerm)}`);
    } else {
      router.push(`/`);
    }
  };

  // ---------------------------------------------------------
  // ✅ UI SECTION (Stylish Update)
  // ---------------------------------------------------------
  return (
    // ✨ Glassmorphism Container with Soft Shadow
    <nav className="fixed top-0 left-0 right-0 z-50 bg-purple-50/80 backdrop-blur-md border-b border-indigo-100/50 transition-all duration-300 shadow-sm shadow-indigo-100/20">
      <div className="max-w-[1500px] mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* 1. BRANDING & LOGO */}
        <div className="flex items-center gap-12">
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

        {/* 2. SEARCH BAR (Modern Floating Input + Dropdown) */}
        {/* ✅ form me ref add kiya */}
        <form ref={searchRef} onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8 transition-all duration-300 relative">
          <div className="relative w-full group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
              <Search size={18} className="text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            </div>
            <input 
              type="text"
              placeholder="Search products..."
              className="w-full pl-11 pr-4 py-2.5 rounded-full bg-white/60 border border-indigo-100 focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10 outline-none text-sm font-medium transition-all shadow-sm hover:shadow-md placeholder:text-slate-400/80 text-slate-700 relative z-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => { if(suggestions.length > 0) setShowSuggestions(true) }} // ✅ Wapas focus karne par show hoga
            />

            {/* ✅ NEW: Suggestions Dropdown Box */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-xl shadow-indigo-100/50 border border-indigo-50 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                {suggestions.map((item) => (
                  <Link 
                    key={item.id} 
                    href={`/product/${item.id}`}
                    onClick={() => {
                        setShowSuggestions(false);
                        setSearchTerm(""); // Optionally clear search term after selecting
                    }}
                    className="flex items-center gap-4 px-4 py-3 hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors cursor-pointer"
                  >
                    <img src={item.img_url} alt={item.title} className="w-10 h-10 rounded-lg object-contain bg-slate-100" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 line-clamp-1">{item.title}</h4>
                      <p className="text-xs text-indigo-600 font-bold mt-0.5">₹{item.price}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </form>

        {/* 3. ACTIONS & PROFILE */}
        <div className="flex items-center gap-5">
          
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

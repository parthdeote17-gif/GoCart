"use client";

// ✅ 1. ADDED: This line fixes the Vercel prerendering error for pages using useSearchParams
export const dynamic = "force-dynamic";

import { useEffect, useState, Suspense } from "react";
import { getProducts, getCategories } from "@/services/product.service";
import Link from "next/link";
import { ArrowRight, Star, Heart, ShoppingBag, Zap, ChevronLeft, ChevronRight, SearchX } from "lucide-react"; 
import { useRouter, useSearchParams } from "next/navigation"; 
import ProductCard from "@/components/ProductCard"; 
import { useQuery } from "@tanstack/react-query"; 

const sliderImages = [
  "/banner1.png", 
  "/banner2.png",
  "/banner3.png",
  "/banner4.png",
  "/banner5.png",
  "/banner6.png"
];

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const searchQuery = searchParams.get("search") || "";
  const selectedCategory = searchParams.get("category") || "All";
  const page = Number(searchParams.get("page")) || 1;

  const [categories, setCategories] = useState<any[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  const isRandomFeed = !searchQuery; 

  // Core Logic Kept Intact
  const { data, isLoading } = useQuery({
    queryKey: ['products', selectedCategory, page, searchQuery, isRandomFeed], 
    queryFn: () => getProducts(selectedCategory, page, 30, searchQuery, isRandomFeed), 
    staleTime: 5 * 60 * 1000, 
  });

  const products = data?.products || [];
  const totalPages = data?.pagination?.totalPages || 1;

  useEffect(() => {
    getCategories().then((data) => {
      setCategories(Array.isArray(data) ? data : []);
    });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    }, 5000); 
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + sliderImages.length) % sliderImages.length);

  const handleCategoryChange = (cat: string) => {
    const params = new URLSearchParams();
    if (cat !== "All") params.append("category", cat);
    params.append("page", "1"); 
    router.push(`/?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams();
    if (selectedCategory !== "All") params.append("category", selectedCategory);
    if (searchQuery) params.append("search", searchQuery);
    params.append("page", newPage.toString());
    
    router.push(`/?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 font-sans overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      
      {/* Enhanced Animated Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
        <div className="absolute inset-0 bg-slate-50/40 backdrop-blur-[80px]"></div>
      </div>

      <div className="relative z-10 w-full">
        {!searchQuery && (
          <div className="max-w-[1500px] mx-auto px-4 sm:px-6 w-full pt-28">
            
            {/* Modernized Image Slider with Ken Burns Effect */}
            <div className="relative w-full h-[350px] md:h-[550px] overflow-hidden mb-12 mx-auto rounded-[2rem] shadow-2xl shadow-indigo-500/10 group">
               {sliderImages.map((img, index) => (
                  <div 
                    key={index}
                    className={`absolute inset-0 transition-all duration-[2000ms] ease-out ${
                      index === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-110"
                    }`}
                  >
                      <img src={img} alt={`Slide ${index + 1}`} className="w-full h-full object-cover" />
                      {/* Beautiful Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>
                  </div>
               ))}

               {/* Modern Navigation Controls */}
               <button onClick={prevSlide} className="absolute left-6 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full text-white hover:bg-white hover:text-indigo-600 hover:scale-110 transition-all duration-300 opacity-0 group-hover:opacity-100 shadow-lg">
                  <ChevronLeft size={24} strokeWidth={2.5} />
               </button>
               <button onClick={nextSlide} className="absolute right-6 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full text-white hover:bg-white hover:text-indigo-600 hover:scale-110 transition-all duration-300 opacity-0 group-hover:opacity-100 shadow-lg">
                  <ChevronRight size={24} strokeWidth={2.5} />
               </button>

               {/* Sleek Pagination Dots */}
               <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                  {sliderImages.map((_, index) => (
                      <button 
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`h-2 rounded-full transition-all duration-500 ${
                          index === currentSlide ? "bg-white w-8 shadow-[0_0_10px_rgba(255,255,255,0.8)]" : "bg-white/40 w-2 hover:bg-white/70"
                        }`}
                      />
                  ))}
               </div>
            </div>

            {/* Glassmorphism Category Bar */}
            <div className="w-full mb-16 relative">
              <div className="w-full overflow-hidden relative group rounded-2xl bg-white/60 backdrop-blur-xl border border-white shadow-sm p-3">
                <div className="category-scroll-container">
                  <button 
                    onClick={() => handleCategoryChange("All")} 
                    className={`category-btn ${selectedCategory === "All" ? "active" : ""}`}
                  >
                    All Products
                  </button>
                  {categories.map((cat: any) => (
                    <button 
                      key={cat.category_name} 
                      onClick={() => handleCategoryChange(cat.category_name)} 
                      className={`category-btn ${selectedCategory === cat.category_name ? "active" : ""}`}
                    >
                      {cat.category_name}
                    </button>
                  ))}
                </div>
                {/* Fade out effect for scroll edges */}
                <div className="absolute right-0 top-0 h-full w-20 bg-gradient-to-l from-white/80 to-transparent pointer-events-none rounded-r-2xl"></div>
              </div>
            </div>
          </div>
        )}

        <section className="max-w-[1500px] mx-auto px-4 sm:px-6 pb-24" style={{ marginTop: searchQuery ? '9rem' : '0' }}>
          
          {/* Animated Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold flex items-center gap-3 tracking-tight">
                {searchQuery ? (
                   <>Results for <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-fuchsia-600">"{searchQuery}"</span></>
                ) : (
                   <span className="text-slate-800">
                     {selectedCategory === "All" ? "Trending Now" : selectedCategory} 
                     <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-orange-400 to-rose-500 text-white shadow-sm transform -translate-y-1">
                       Hot 🔥
                     </span>
                   </span>
                )}
              </h2>
            </div>
            <span className="px-4 py-1.5 rounded-full text-sm font-bold text-slate-500 bg-white border border-slate-200 shadow-sm flex items-center gap-2">
              Page <span className="text-indigo-600">{page}</span> of {totalPages}
            </span>
          </div>

          {isLoading ? (
            /* Premium Skeleton Loading */
            <div className="product-grid">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="skeleton-card">
                  <div className="skeleton-img"></div>
                  <div className="skeleton-text w-3/4"></div>
                  <div className="skeleton-text w-1/2 mt-2"></div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            /* Beautiful Empty State */
            <div className="flex flex-col items-center justify-center p-16 text-center bg-white/50 backdrop-blur-xl border border-white rounded-[2rem] shadow-sm max-w-3xl mx-auto">
              <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <SearchX size={48} className="text-indigo-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-3">Oops! Nothing found</h2>
              <p className="text-slate-500 mb-8 max-w-md">We couldn't find any products matching your current filters. Try adjusting your search or exploring our categories.</p>
              <button onClick={() => router.push(`/`)} className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-slate-900/20 active:scale-95">
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              {/* Product Grid */}
              <div className="product-grid">
                {products.map((product: any) => (
                  <div key={product.id} className="transition-transform duration-300 hover:-translate-y-2">
                     <ProductCard product={product} />
                  </div>
                ))}
              </div>

              {/* Modern Pagination */}
              <div className="flex justify-center items-center gap-4 mt-20">
                <button 
                  disabled={page === 1}
                  onClick={() => handlePageChange(Math.max(1, page - 1))}
                  className={`page-btn ${page === 1 ? "opacity-50 cursor-not-allowed" : "hover:-translate-x-1 hover:shadow-md hover:text-indigo-600"}`}
                >
                  <ArrowRight size={18} className="rotate-180" />
                  Previous
                </button>
                
                <div className="px-5 py-2.5 bg-white font-bold rounded-xl border border-slate-200 shadow-sm flex items-center gap-2">
                  <span className="text-indigo-600 text-lg">{page}</span> 
                  <span className="text-slate-300">/</span> 
                  <span className="text-slate-600">{totalPages}</span>
                </div>

                <button 
                  disabled={page >= totalPages}
                  onClick={() => handlePageChange(page + 1)}
                  className={`page-btn-next ${page >= totalPages ? "opacity-50 cursor-not-allowed" : "hover:translate-x-1 hover:shadow-lg hover:shadow-indigo-600/20"}`}
                >
                  Next
                  <ArrowRight size={18} />
                </button>
              </div>
            </>
          )}
        </section>

        {/* Feature Section with Hover Lift */}
        <section className="max-w-[1500px] mx-auto px-4 sm:px-6 pb-20">
          <div className="bg-white/60 backdrop-blur-2xl border border-white/80 rounded-[2.5rem] p-10 md:p-14 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16">
              {[
                { title: "Lightning Delivery", desc: "Get your products delivered within 24 hours globally.", color: "from-violet-500 to-fuchsia-500", shadow: "shadow-violet-500/20", bg: "bg-violet-50", text: "text-violet-600", Icon: Zap },
                { title: "100% Secure Payments", desc: "Your transactions are protected by bank-level encryption.", color: "from-fuchsia-500 to-rose-500", shadow: "shadow-fuchsia-500/20", bg: "bg-fuchsia-50", text: "text-fuchsia-600", Icon: Heart },
                { title: "24/7 Premium Support", desc: "Our dedicated team is here to help you anytime.", color: "from-cyan-500 to-blue-500", shadow: "shadow-cyan-500/20", bg: "bg-cyan-50", text: "text-cyan-600", Icon: ShoppingBag }
              ].map((feature, i) => (
                <div key={i} className="group flex flex-col items-center text-center p-6 rounded-3xl transition-all duration-300 hover:bg-white hover:shadow-xl hover:-translate-y-2 cursor-default">
                  <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 ${feature.bg} ${feature.text} shadow-lg ${feature.shadow} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                    <feature.Icon size={36} strokeWidth={2} />
                  </div>
                  <h4 className="text-xl font-bold text-slate-800 mb-3">{feature.title}</h4>
                  <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>

      <style jsx global>{`
        /* Refined Animations */
        @keyframes pulse-subtle { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
        @keyframes float { 0% { transform: translateY(0px) scale(1); } 50% { transform: translateY(-20px) scale(1.05); } 100% { transform: translateY(0px) scale(1); } }
        
        /* Ambient Background Blobs */
        .blob { position: absolute; border-radius: 50%; filter: blur(150px); opacity: 0.5; animation: float 10s ease-in-out infinite; mix-blend-mode: multiply; }
        .blob-1 { top: -10%; left: -10%; width: 800px; height: 800px; background: #c4b5fd; animation-duration: 12s; }
        .blob-2 { bottom: 10%; right: -10%; width: 600px; height: 600px; background: #a5f3fc; animation-duration: 15s; animation-delay: 2s; }
        .blob-3 { top: 30%; left: 30%; width: 500px; height: 500px; background: #fbcfe8; animation-duration: 10s; animation-delay: 5s; }
        
        /* Custom Scrollbar for Categories */
        .category-scroll-container { display: flex; gap: 0.75rem; overflow-x: auto; padding: 0.5rem; width: 100%; scrollbar-width: none; -ms-overflow-style: none; }
        .category-scroll-container::-webkit-scrollbar { display: none; }
        
        /* Modernized Category Buttons */
        .category-btn { flex: 0 0 auto; white-space: nowrap; padding: 0.6rem 1.75rem; border-radius: 9999px; font-weight: 600; font-size: 0.95rem; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; border: 1px solid #e2e8f0; background: rgba(255, 255, 255, 0.9); color: #64748b; }
        .category-btn:hover:not(.active) { background: #f8fafc; color: #334155; transform: translateY(-2px); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
        .category-btn.active { border-color: transparent; background: linear-gradient(135deg, #6366f1, #a855f7); color: #ffffff; box-shadow: 0 10px 20px -5px rgba(99, 102, 241, 0.4); transform: scale(1.05); }
        
        /* Grid Layouts */
        .product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 2rem; }
        
        /* Premium Buttons */
        .page-btn { padding: 0.8rem 1.5rem; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 1rem; font-weight: 600; color: #475569; cursor: pointer; transition: all 0.3s; display: flex; align-items: center; gap: 0.5rem; }
        .page-btn-next { padding: 0.8rem 1.5rem; background: #0f172a; border: 1px solid transparent; border-radius: 1rem; font-weight: 600; color: #ffffff; cursor: pointer; transition: all 0.3s; display: flex; align-items: center; gap: 0.5rem; }
        
        /* Refined Skeleton Loader */
        .skeleton-card { aspect-ratio: 3/4; background: rgba(255, 255, 255, 0.6); backdrop-filter: blur(10px); border-radius: 1.5rem; border: 1px solid rgba(255, 255, 255, 0.8); padding: 1.25rem; animation: pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
        .skeleton-img { width: 100%; height: 75%; background: #e2e8f0; border-radius: 1rem; margin-bottom: 1.25rem; }
        .skeleton-text { height: 1.25rem; background: #e2e8f0; border-radius: 0.375rem; }
        
        @media (max-width: 768px) {
          .product-grid { grid-template-columns: repeat(2, 1fr); gap: 1rem; }
        }
        @media (max-width: 480px) {
          .product-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 bg-indigo-100 rounded-full"></div>
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}

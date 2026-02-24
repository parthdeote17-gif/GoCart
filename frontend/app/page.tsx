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
    <div className="relative min-h-screen bg-[#f8fafc] text-[#0f172a] font-sans overflow-x-hidden">
      
      {/* Background Blobs - Kept Subtle but behind everything */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      <div className="relative z-10 w-full">
        {!searchQuery && (
          <div className="max-w-[1500px] mx-auto px-4 w-full pt-32">
            
            {/* Slider - ✅ RESTORED ORIGINAL SIZE (300px mobile / 500px desktop) */}
            <div className="relative w-full h-[300px] md:h-[500px] overflow-hidden mb-10 mx-auto rounded-3xl shadow-2xl group bg-gray-200">
               {sliderImages.map((img, index) => (
                  <div 
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                      index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
                    }`}
                  >
                      <img src={img} alt={`Slide ${index + 1}`} className="w-full h-full object-cover" />
                      {/* Gradient overlay for text readability on slide if needed */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60"></div>
                  </div>
               ))}

               <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-white/90 rounded-full text-black hover:bg-white hover:scale-110 transition-all opacity-0 group-hover:opacity-100 shadow-lg">
                  <ChevronLeft size={24} />
               </button>
               <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-white/90 rounded-full text-black hover:bg-white hover:scale-110 transition-all opacity-0 group-hover:opacity-100 shadow-lg">
                  <ChevronRight size={24} />
               </button>

               <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                  {sliderImages.map((_, index) => (
                      <button 
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`transition-all duration-300 rounded-full shadow-sm ${
                          index === currentSlide ? "bg-white w-8 h-2" : "bg-white/60 w-2 h-2 hover:bg-white"
                        }`}
                      />
                  ))}
               </div>
            </div>

            {/* Category Bar - ✅ Solid Background (Not Faint) */}
            <div className="w-full mb-16 relative">
              <div className="w-full overflow-hidden relative group rounded-2xl bg-white border border-slate-200 shadow-sm p-3">
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
                {/* Fade effect on the right edge */}
                <div className="absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-white to-transparent pointer-events-none md:hidden"></div>
              </div>
            </div>
          </div>
        )}

        <section className="max-w-[1500px] mx-auto px-4 pb-24" style={{ marginTop: searchQuery ? '9rem' : '0' }}>
          
          {/* Section Header - ✅ High Contrast Text */}
          <div className="flex items-end justify-between mb-8 px-2">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                {searchQuery ? (
                   <>Results for <span className="text-indigo-600">"{searchQuery}"</span></>
                ) : (
                   <>
                     {selectedCategory === "All" ? "Trending Now" : selectedCategory} 
                     <span className="text-sm font-medium bg-rose-100 text-rose-600 px-2 py-1 rounded-md border border-rose-200">
                       Hot
                     </span>
                   </>
                )}
              </h2>
            </div>
            <span className="hidden md:block px-3 py-1 rounded-full text-sm font-semibold text-slate-600 bg-white border border-slate-200 shadow-sm">
              Page {page} of {totalPages}
            </span>
          </div>

          {isLoading ? (
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
            <div className="flex flex-col items-center justify-center p-16 text-center bg-white border border-slate-200 rounded-3xl shadow-sm">
              <div className="text-6xl mb-4">🛍️</div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">No products found</h2>
              <p className="text-slate-500 mb-6">Try adjusting your search or filter to find what you're looking for.</p>
              <button onClick={() => router.push(`/`)} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-md">
                Clear Search & Filters
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

              {/* Pagination - ✅ High Contrast Buttons */}
              <div className="flex justify-center items-center gap-4 mt-16">
                <button 
                  disabled={page === 1}
                  onClick={() => handlePageChange(Math.max(1, page - 1))}
                  className={`page-btn ${page === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200"}`}
                >
                  <ArrowRight size={18} className="rotate-180" />
                  Prev
                </button>
                
                <div className="px-4 py-2 bg-white font-bold rounded-xl border border-slate-200 text-indigo-600 shadow-sm">
                  {page} <span className="text-slate-400 font-normal mx-1">/</span> {totalPages}
                </div>

                <button 
                  disabled={page >= totalPages}
                  onClick={() => handlePageChange(page + 1)}
                  className={`page-btn-next ${page >= totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-slate-800 shadow-lg"}`}
                >
                  Next
                  <ArrowRight size={18} />
                </button>
              </div>
            </>
          )}
        </section>

        {/* Feature Section - ✅ Solid White Cards (Not Faint) */}
        <section className="max-w-[1500px] mx-auto px-4 pb-20">
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 md:p-14 shadow-xl shadow-slate-200/50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16 text-center">
              {[
                { title: "Instant Delivery", desc: "Get products delivered within 24 hours.", color: "bg-violet-50 text-violet-600", Icon: Zap },
                { title: "Secure Payments", desc: "100% secure payment gateway.", color: "bg-fuchsia-50 text-fuchsia-600", Icon: Heart },
                { title: "24/7 Support", desc: "Dedicated support team for you.", color: "bg-cyan-50 text-cyan-600", Icon: ShoppingBag }
              ].map((feature, i) => (
                <div key={i} className="flex flex-col items-center group">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 ${feature.color} transition-transform duration-300 group-hover:scale-110`}>
                    <feature.Icon size={30} strokeWidth={2.5} />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h4>
                  <p className="text-slate-500 text-sm max-w-[200px]">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>

      <style jsx global>{`
        /* Core Animations */
        @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }
        
        /* Background Blobs - Slightly muted to prevent washing out text */
        .blob { position: absolute; border-radius: 50%; filter: blur(100px); opacity: 0.25; animation: float 8s ease-in-out infinite; }
        .blob-1 { top: -10%; left: -10%; width: 600px; height: 600px; background: #a855f7; }
        .blob-2 { bottom: 10%; right: -10%; width: 500px; height: 500px; background: #22d3ee; animation-delay: 2s; }
        .blob-3 { top: 40%; left: 20%; width: 300px; height: 300px; background: #f472b6; }
        
        /* Category Scroll */
        .category-scroll-container { display: flex; gap: 0.75rem; overflow-x: auto; padding: 0.25rem; width: 100%; scrollbar-width: none; }
        .category-scroll-container::-webkit-scrollbar { display: none; }
        
        /* Category Buttons - High Contrast */
        .category-btn { flex: 0 0 auto; white-space: nowrap; padding: 0.6rem 1.5rem; border-radius: 9999px; font-weight: 600; font-size: 0.9rem; transition: all 0.2s; cursor: pointer; border: 1px solid #e2e8f0; background: #f1f5f9; color: #64748b; }
        .category-btn:hover { background: #e2e8f0; color: #334155; }
        .category-btn.active { border-color: transparent; background: #0f172a; color: #ffffff; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.3); transform: scale(1.05); }
        
        /* Grid */
        .product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1.5rem; }
        
        /* Pagination Buttons */
        .page-btn { padding: 0.75rem 1.5rem; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 0.75rem; font-weight: 700; color: #64748b; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 0.5rem; }
        .page-btn-next { padding: 0.75rem 1.5rem; background: #0f172a; border: none; border-radius: 0.75rem; font-weight: 700; color: #ffffff; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 0.5rem; }
        
        /* Skeleton */
        .skeleton-card { aspect-ratio: 3/4; background: #ffffff; border-radius: 1.5rem; border: 1px solid #f1f5f9; padding: 1rem; }
        .skeleton-img { width: 100%; height: 70%; background: #f1f5f9; border-radius: 1rem; margin-bottom: 1rem; }
        .skeleton-text { height: 1rem; background: #f1f5f9; border-radius: 0.25rem; }
        
        @media (max-width: 768px) {
          .product-grid { grid-template-columns: repeat(2, 1fr); gap: 1rem; }
          .page-btn, .page-btn-next { padding: 0.6rem 1rem; font-size: 0.9rem; }
        }
      `}</style>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600"></div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}

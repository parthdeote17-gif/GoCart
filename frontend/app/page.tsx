"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, Suspense } from "react";
import { getProducts, getCategories } from "@/services/product.service";
import Link from "next/link";
import { ArrowRight, Star, Heart, ShoppingBag, Zap, ChevronLeft, ChevronRight, SearchX } from "lucide-react"; 
import { useRouter, useSearchParams } from "next/navigation"; 
import ProductCard from "@/components/ProductCard"; 
import { useQuery } from "@tanstack/react-query"; 

// ✅ UPDATED: Real High-Quality Web Images
const sliderImages = [
  "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop", // Sale
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop", // Fashion
  "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=2071&auto=format&fit=crop", // Tech
  "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?q=80&w=2070&auto=format&fit=crop", // Living
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1999&auto=format&fit=crop", // Watch
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1950&auto=format&fit=crop"  // Store
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
      
      {/* Background Blobs (Kept subtle behind everything) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      <div className="relative z-10 w-full">
        {!searchQuery && (
          <div className="max-w-[1500px] mx-auto px-4 w-full pt-32">
            
            {/* ✅ SLIDER (Updated with Real Images) */}
            <div className="relative w-full h-[300px] md:h-[500px] overflow-hidden mb-12 mx-auto rounded-3xl shadow-2xl group bg-gray-200 ring-1 ring-white/50">
               {sliderImages.map((img, index) => (
                  <div 
                    key={index}
                    className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                      index === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-105"
                    }`}
                  >
                      <img src={img} alt={`Slide ${index + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60"></div>
                  </div>
               ))}

               <button onClick={prevSlide} className="absolute left-6 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/30 backdrop-blur-md border border-white/40 rounded-full text-white hover:bg-white hover:text-black transition-all opacity-0 group-hover:opacity-100 shadow-lg hover:scale-110">
                  <ChevronLeft size={24} />
               </button>
               <button onClick={nextSlide} className="absolute right-6 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/30 backdrop-blur-md border border-white/40 rounded-full text-white hover:bg-white hover:text-black transition-all opacity-0 group-hover:opacity-100 shadow-lg hover:scale-110">
                  <ChevronRight size={24} />
               </button>

               <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                  {sliderImages.map((_, index) => (
                      <button 
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`h-2 rounded-full transition-all duration-500 shadow-sm ${
                          index === currentSlide ? "bg-white w-8" : "bg-white/50 w-2 hover:bg-white"
                        }`}
                      />
                  ))}
               </div>
            </div>

            {/* ✅ CATEGORY DOCK */}
            <div className="w-full mb-16 px-2">
              <div className="max-w-6xl mx-auto overflow-hidden relative group rounded-full bg-white border border-slate-200 shadow-lg shadow-slate-200/50 p-2">
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
                <div className="absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-white to-transparent pointer-events-none md:hidden rounded-r-full"></div>
              </div>
            </div>

            {/* ✅ NEW: PROMOTIONAL BLOCKS (Grid Layout) */}
            {selectedCategory === "All" && (
              <div className="flex flex-wrap justify-center items-stretch gap-6 mb-20">
                
                {/* Block 1: Home (Teal) */}
                <div className="w-[100%] md:w-[47%] lg:w-[23%] bg-white p-5 rounded-2xl shadow-lg border border-slate-100 transition-transform hover:-translate-y-2 cursor-pointer group">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Revamp your home</h3>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-slate-50 p-2 rounded-xl text-xs text-center font-medium"><img src="https://images.unsplash.com/photo-1584100936595-c0654b55a2e6?w=400&q=80" className="w-full h-20 object-cover rounded-lg mb-2"/>Cushions</div>
                      <div className="bg-slate-50 p-2 rounded-xl text-xs text-center font-medium"><img src="https://images.unsplash.com/photo-1544457070-4cd773b4d71e?w=400&q=80" className="w-full h-20 object-cover rounded-lg mb-2"/>Decor</div>
                      <div className="bg-slate-50 p-2 rounded-xl text-xs text-center font-medium"><img src="https://images.unsplash.com/photo-1595514535415-8aeac6f66318?w=400&q=80" className="w-full h-20 object-cover rounded-lg mb-2"/>Storage</div>
                      <div className="bg-slate-50 p-2 rounded-xl text-xs text-center font-medium"><img src="https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400&q=80" className="w-full h-20 object-cover rounded-lg mb-2"/>Lighting</div>
                    </div>
                    <span className="text-teal-600 text-sm font-bold flex items-center gap-1 group-hover:text-teal-800">Explore <ArrowRight size={14}/></span>
                </div>

                {/* Block 2: Appliances (Indigo) */}
                <div className="w-[100%] md:w-[47%] lg:w-[23%] bg-white p-5 rounded-2xl shadow-lg border border-slate-100 transition-transform hover:-translate-y-2 cursor-pointer group">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Appliances | 55% off</h3>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-slate-50 p-2 rounded-xl text-xs text-center font-medium"><img src="https://images.unsplash.com/photo-1620288627223-53302f4e8c74?w=400&q=80" className="w-full h-20 object-cover rounded-lg mb-2"/>ACs</div>
                      <div className="bg-slate-50 p-2 rounded-xl text-xs text-center font-medium"><img src="https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=400&q=80" className="w-full h-20 object-cover rounded-lg mb-2"/>Washers</div>
                      <div className="bg-slate-50 p-2 rounded-xl text-xs text-center font-medium"><img src="https://images.unsplash.com/photo-1585659722983-38ca8da4e508?w=400&q=80" className="w-full h-20 object-cover rounded-lg mb-2"/>Microwaves</div>
                      <div className="bg-slate-50 p-2 rounded-xl text-xs text-center font-medium"><img src="https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=400&q=80" className="w-full h-20 object-cover rounded-lg mb-2"/>Fridges</div>
                    </div>
                    <span className="text-indigo-600 text-sm font-bold flex items-center gap-1 group-hover:text-indigo-800">Explore <ArrowRight size={14}/></span>
                </div>

                {/* Block 3: Tech (Amber) */}
                <div className="w-[100%] md:w-[47%] lg:w-[23%] bg-white p-5 rounded-2xl shadow-lg border border-slate-100 transition-transform hover:-translate-y-2 cursor-pointer group">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Latest Mobiles</h3>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-slate-50 p-2 rounded-xl text-xs text-center font-medium"><img src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80" className="w-full h-20 object-cover rounded-lg mb-2"/>Phones</div>
                      <div className="bg-slate-50 p-2 rounded-xl text-xs text-center font-medium"><img src="https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=400&q=80" className="w-full h-20 object-cover rounded-lg mb-2"/>Buds</div>
                      <div className="bg-slate-50 p-2 rounded-xl text-xs text-center font-medium"><img src="https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&q=80" className="w-full h-20 object-cover rounded-lg mb-2"/>Speakers</div>
                      <div className="bg-slate-50 p-2 rounded-xl text-xs text-center font-medium"><img src="https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400&q=80" className="w-full h-20 object-cover rounded-lg mb-2"/>Headsets</div>
                    </div>
                    <span className="text-amber-600 text-sm font-bold flex items-center gap-1 group-hover:text-amber-800">Explore <ArrowRight size={14}/></span>
                </div>

                {/* Block 4: Fashion (Pink) */}
                <div className="w-[100%] md:w-[47%] lg:w-[23%] bg-white p-5 rounded-2xl shadow-lg border border-slate-100 transition-transform hover:-translate-y-2 cursor-pointer group">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Fashion | 60% off</h3>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-slate-50 p-2 rounded-xl text-xs text-center font-medium"><img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80" className="w-full h-20 object-cover rounded-lg mb-2"/>Casual</div>
                      <div className="bg-slate-50 p-2 rounded-xl text-xs text-center font-medium"><img src="https://images.unsplash.com/photo-1594938291221-94f18cbb5660?w=400&q=80" className="w-full h-20 object-cover rounded-lg mb-2"/>Formal</div>
                      <div className="bg-slate-50 p-2 rounded-xl text-xs text-center font-medium"><img src="https://images.unsplash.com/photo-1533313264027-ec1be93c78ce?w=400&q=80" className="w-full h-20 object-cover rounded-lg mb-2"/>Winter</div>
                      <div className="bg-slate-50 p-2 rounded-xl text-xs text-center font-medium"><img src="https://images.unsplash.com/photo-1523206489230-c012c64b2b48?w=400&q=80" className="w-full h-20 object-cover rounded-lg mb-2"/>Extras</div>
                    </div>
                    <span className="text-pink-600 text-sm font-bold flex items-center gap-1 group-hover:text-pink-800">Explore <ArrowRight size={14}/></span>
                </div>
              </div>
            )}

            {/* ✅ NEW: HORIZONTAL SCROLL ROWS */}
            {selectedCategory === "All" && products.length > 0 && (
              <div className="mb-20">
                <HorizontalScrollRow title="Top Deals This Week" products={products} accentColor="from-violet-500 to-fuchsia-500" />
                <HorizontalScrollRow title="Home Essentials" products={products} accentColor="from-cyan-500 to-blue-500" />
              </div>
            )}

          </div>
        )}

        {/* ✅ MAIN CONTENT SECTION */}
        <section className="max-w-[1500px] mx-auto px-4 pb-24" style={{ marginTop: searchQuery ? '8rem' : '0' }}>
          
          <div className="flex items-end justify-between mb-8 px-2">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2">
                {searchQuery ? (
                   <>Results for <span className="text-indigo-600">"{searchQuery}"</span></>
                ) : (
                   <>
                     {selectedCategory === "All" ? "More to Explore" : selectedCategory} 
                     <span className="text-sm font-semibold bg-rose-100 text-rose-600 px-3 py-1 rounded-full border border-rose-200 animate-pulse">
                       Hot Deals
                     </span>
                   </>
                )}
              </h2>
            </div>
            <span className="hidden md:block px-4 py-1.5 rounded-full text-sm font-semibold text-slate-700 bg-white border border-slate-200 shadow-sm">
              Page <span className="text-indigo-600">{page}</span> of {totalPages}
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
              <div className="text-6xl mb-4 text-slate-300"><SearchX size={64}/></div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">No products found</h2>
              <p className="text-slate-500 mb-6">Try adjusting your search or filter.</p>
              <button onClick={() => router.push(`/`)} className="px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors shadow-lg">
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

              {/* Pagination */}
              <div className="flex justify-center items-center gap-4 mt-16">
                <button 
                  disabled={page === 1}
                  onClick={() => handlePageChange(Math.max(1, page - 1))}
                  className={`page-btn ${page === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200"}`}
                >
                  <ArrowRight size={18} className="rotate-180" />
                  Prev
                </button>
                
                <div className="px-5 py-2.5 bg-white font-bold rounded-xl border border-slate-200 text-indigo-600 shadow-sm">
                  {page} <span className="text-slate-300 mx-2">/</span> {totalPages}
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

        {/* Features Footer */}
        <section className="max-w-[1500px] mx-auto px-4 pb-20">
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 md:p-14 shadow-xl shadow-slate-200/50 relative overflow-hidden">
             {/* Decorative colored blur spots inside card */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16 text-center relative z-10">
              {[
                { title: "Instant Delivery", desc: "Get products delivered within 24 hours.", color: "bg-violet-50 text-violet-600", Icon: Zap },
                { title: "Secure Payments", desc: "100% secure payment gateway.", color: "bg-fuchsia-50 text-fuchsia-600", Icon: Heart },
                { title: "24/7 Support", desc: "Dedicated support team for you.", color: "bg-cyan-50 text-cyan-600", Icon: ShoppingBag }
              ].map((feature, i) => (
                <div key={i} className="flex flex-col items-center group">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 ${feature.color} transition-transform duration-300 group-hover:scale-110 shadow-sm`}>
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
        
        .blob { position: absolute; border-radius: 50%; filter: blur(100px); opacity: 0.4; animation: float 8s ease-in-out infinite; }
        .blob-1 { top: -10%; left: -10%; width: 600px; height: 600px; background: #c4b5fd; }
        .blob-2 { bottom: 10%; right: -10%; width: 500px; height: 500px; background: #67e8f9; animation-delay: 2s; }
        .blob-3 { top: 40%; left: 20%; width: 300px; height: 300px; background: #fbcfe8; }
        
        /* Category Scroll */
        .category-scroll-container { display: flex; gap: 0.75rem; overflow-x: auto; padding: 0.25rem; width: 100%; scrollbar-width: none; align-items: center; }
        .category-scroll-container::-webkit-scrollbar { display: none; }
        
        .category-btn { flex: 0 0 auto; white-space: nowrap; padding: 0.65rem 1.75rem; border-radius: 9999px; font-weight: 600; font-size: 0.95rem; transition: all 0.2s; cursor: pointer; border: 1px solid transparent; background: #f1f5f9; color: #64748b; }
        .category-btn:hover { background: #e2e8f0; color: #334155; }
        .category-btn.active { background: #0f172a; color: #ffffff; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.3); transform: scale(1.05); }
        
        /* Grid */
        .product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1.5rem; }
        
        /* Pagination */
        .page-btn { padding: 0.75rem 1.5rem; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 0.75rem; font-weight: 700; color: #64748b; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 0.5rem; }
        .page-btn-next { padding: 0.75rem 1.5rem; background: #0f172a; border: none; border-radius: 0.75rem; font-weight: 700; color: #ffffff; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 0.5rem; }
        
        /* Scrollbar Hide for Horizontal Rows */
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

        /* Skeleton */
        .skeleton-card { aspect-ratio: 3/4; background: #ffffff; border-radius: 1.5rem; border: 1px solid #f1f5f9; padding: 1rem; }
        .skeleton-img { width: 100%; height: 70%; background: #f1f5f9; border-radius: 1rem; margin-bottom: 1rem; }
        .skeleton-text { height: 1rem; background: #f1f5f9; border-radius: 0.25rem; }
        
        @media (max-width: 768px) {
          .product-grid { grid-template-columns: repeat(2, 1fr); gap: 1rem; }
        }
      `}</style>
    </div>
  );
}

// ✅ HELPER COMPONENT: For Horizontal Scrolling Rows
function HorizontalScrollRow({ title, products, accentColor }: { title: string, products: any[], accentColor: string }) {
  // Only take first 10 products for the row
  const rowProducts = products.slice(0, 10);

  return (
    <div className="bg-white relative mb-8 p-6 border border-slate-100 rounded-[2rem] shadow-lg shadow-slate-200/50">
      <div className={`absolute left-0 top-[30px] w-[6px] h-[35px] bg-gradient-to-b ${accentColor} rounded-r-md`}></div>
      
      <h2 className="text-xl font-extrabold text-slate-800 mb-5 pl-4 flex items-center justify-between">
        {title}
        <Link href="/" className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 group">
          View All <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </h2>
      
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
        {rowProducts.map((p, idx) => (
          <Link key={idx} href={`/product/${p.id}`} className="snap-start shrink-0 w-[160px] bg-slate-50 rounded-2xl p-3 border border-slate-100 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md flex flex-col justify-between group">
            <div className="bg-white rounded-xl p-2 mb-3 h-[120px] flex items-center justify-center">
               <img src={p.image || `https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop`} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" alt={p.title} />
            </div>
            <p className="text-xs font-bold text-slate-700 line-clamp-2 leading-tight min-h-[32px]">
              {p.title || "Product Name"}
            </p>
          </Link>
        ))}
        
        {/* See All Card */}
        <Link href="/" className={`snap-start shrink-0 w-[160px] bg-gradient-to-br ${accentColor} text-white rounded-2xl p-4 flex flex-col items-center justify-center shadow-lg hover:scale-95 transition-transform`}>
           <div className="bg-white/20 p-3 rounded-full mb-2">
             <ArrowRight size={24} />
           </div>
           <span className="font-bold text-sm uppercase tracking-wider text-center">See All<br/>Offers</span>
        </Link>
      </div>
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

"use client";

// ✅ 1. ADDED: This line fixes the Vercel prerendering error for pages using useSearchParams
export const dynamic = "force-dynamic";

import { useEffect, useState, Suspense } from "react"; 
import { getProducts, getCategories } from "@/services/product.service";
import Link from "next/link";
import { ArrowRight, Heart, ShoppingBag, Zap, ChevronLeft, ChevronRight, SearchX } from "lucide-react"; 
import { useRouter, useSearchParams } from "next/navigation"; 
import ProductCard from "@/components/ProductCard"; 
import { useQuery } from "@tanstack/react-query"; 

// ✅ SLIDER IMAGES KEPT AS ORIGINAL
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
      
      {/* BACKGROUND BLOBS */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      <div className="relative z-10 w-full">
        {!searchQuery && (
          <div className="max-w-[1500px] mx-auto px-4 w-full pt-28">
            
            {/* ✅ IMAGE SLIDER */}
            <div className="relative w-full h-[300px] md:h-[500px] overflow-hidden mb-10 mx-auto rounded-3xl shadow-xl group bg-slate-900">
               {sliderImages.map((img, index) => (
                  <div 
                    key={index}
                    className={`absolute inset-0 transition-all duration-1000 ease-in-out ${index === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-105"}`}
                  >
                      <img src={img} alt={`Slide ${index + 1}`} className="w-full h-full object-cover" />
                  </div>
               ))}

               <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/40 backdrop-blur-md border border-white/30 rounded-full text-white hover:bg-white hover:text-slate-900 transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 shadow-lg">
                  <ChevronLeft size={24} />
               </button>
               <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/40 backdrop-blur-md border border-white/30 rounded-full text-white hover:bg-white hover:text-slate-900 transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 shadow-lg">
                  <ChevronRight size={24} />
               </button>

               <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                  {sliderImages.map((_, index) => (
                      <button 
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`transition-all duration-300 rounded-full ${index === currentSlide ? "bg-white w-8 h-2 shadow-[0_0_8px_rgba(255,255,255,0.8)]" : "bg-white/50 hover:bg-white/80 w-2 h-2"}`}
                      />
                  ))}
               </div>
            </div>

            {/* ✅ CATEGORY SLIDER (Capsule Style) */}
            <div className="w-full mb-12 relative px-2">
              <div className="max-w-6xl mx-auto bg-white rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-slate-100 p-2 overflow-hidden relative">
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
                {/* Scroll Indicators */}
                <div className="absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-white to-transparent pointer-events-none rounded-r-full"></div>
                <div className="absolute left-0 top-0 h-full w-8 bg-gradient-to-r from-white to-transparent pointer-events-none rounded-l-full"></div>
              </div>
            </div>

            {/* ✅ PROMOTIONAL BLOCKS (FIXED IMAGES WITH no-referrer) */}
            {selectedCategory === "All" && (
              <div className="flex flex-wrap justify-center items-stretch gap-6 mb-16">
                
                {/* Block 1: Home */}
                <Link href="/" className="w-[100%] md:w-[47%] lg:w-[23%] no-underline group">
                  <div className="bg-white p-5 h-full flex flex-col justify-between shadow-sm border border-slate-200 rounded-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                    <h3 className="text-[17px] font-bold text-slate-800 mb-4">Revamp your home</h3>
                    <div className="grid grid-cols-2 gap-3 mt-2 flex-grow">
                      <div className="text-[12px] text-center font-medium text-slate-700"><img src="https://images.unsplash.com/photo-1584100936595-c0654b55a2e6?w=400&q=80" referrerPolicy="no-referrer" className="w-full h-[90px] object-cover rounded-xl mb-2 group-hover:scale-105 transition-transform bg-slate-100" /> Cushions</div>
                      <div className="text-[12px] text-center font-medium text-slate-700"><img src="https://images.unsplash.com/photo-1544457070-4cd773b4d71e?w=400&q=80" referrerPolicy="no-referrer" className="w-full h-[90px] object-cover rounded-xl mb-2 group-hover:scale-105 transition-transform bg-slate-100" /> Decor</div>
                      <div className="text-[12px] text-center font-medium text-slate-700"><img src="https://images.unsplash.com/photo-1595514535415-8aeac6f66318?w=400&q=80" referrerPolicy="no-referrer" className="w-full h-[90px] object-cover rounded-xl mb-2 group-hover:scale-105 transition-transform bg-slate-100" /> Storage</div>
                      <div className="text-[12px] text-center font-medium text-slate-700"><img src="https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400&q=80" referrerPolicy="no-referrer" className="w-full h-[90px] object-cover rounded-xl mb-2 group-hover:scale-105 transition-transform bg-slate-100" /> Lighting</div>
                    </div>
                    <h4 className="mt-5 text-[14px] font-bold text-teal-600 flex items-center gap-1 group-hover:text-teal-800">Explore <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></h4>
                  </div>
                </Link>

                {/* Block 2: Appliances */}
                <Link href="/" className="w-[100%] md:w-[47%] lg:w-[23%] no-underline group">
                  <div className="bg-white p-5 h-full flex flex-col justify-between shadow-sm border border-slate-200 rounded-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                    <h3 className="text-[17px] font-bold text-slate-800 mb-4">Appliances | 55% off</h3>
                    <div className="grid grid-cols-2 gap-3 mt-2 flex-grow">
                      <div className="text-[12px] text-center font-medium text-slate-700"><img src="https://images.unsplash.com/photo-1620288627223-53302f4e8c74?w=400&q=80" referrerPolicy="no-referrer" className="w-full h-[90px] object-cover rounded-xl mb-2 group-hover:scale-105 transition-transform bg-slate-100" /> ACs</div>
                      <div className="text-[12px] text-center font-medium text-slate-700"><img src="https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=400&q=80" referrerPolicy="no-referrer" className="w-full h-[90px] object-cover rounded-xl mb-2 group-hover:scale-105 transition-transform bg-slate-100" /> Washers</div>
                      <div className="text-[12px] text-center font-medium text-slate-700"><img src="https://images.unsplash.com/photo-1585659722983-38ca8da4e508?w=400&q=80" referrerPolicy="no-referrer" className="w-full h-[90px] object-cover rounded-xl mb-2 group-hover:scale-105 transition-transform bg-slate-100" /> Microwaves</div>
                      <div className="text-[12px] text-center font-medium text-slate-700"><img src="https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=400&q=80" referrerPolicy="no-referrer" className="w-full h-[90px] object-cover rounded-xl mb-2 group-hover:scale-105 transition-transform bg-slate-100" /> Fridges</div>
                    </div>
                    <h4 className="mt-5 text-[14px] font-bold text-indigo-600 flex items-center gap-1 group-hover:text-indigo-800">Explore <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></h4>
                  </div>
                </Link>

                {/* Block 3: Mobiles */}
                <Link href="/" className="w-[100%] md:w-[47%] lg:w-[23%] no-underline group">
                  <div className="bg-white p-5 h-full flex flex-col justify-between shadow-sm border border-slate-200 rounded-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                    <h3 className="text-[17px] font-bold text-slate-800 mb-4">Latest Mobiles</h3>
                    <div className="grid grid-cols-2 gap-3 mt-2 flex-grow">
                      <div className="text-[12px] text-center font-medium text-slate-700"><img src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80" referrerPolicy="no-referrer" className="w-full h-[90px] object-cover rounded-xl mb-2 group-hover:scale-105 transition-transform bg-slate-100" /> Phones</div>
                      <div className="text-[12px] text-center font-medium text-slate-700"><img src="https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=400&q=80" referrerPolicy="no-referrer" className="w-full h-[90px] object-cover rounded-xl mb-2 group-hover:scale-105 transition-transform bg-slate-100" /> Buds</div>
                      <div className="text-[12px] text-center font-medium text-slate-700"><img src="https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&q=80" referrerPolicy="no-referrer" className="w-full h-[90px] object-cover rounded-xl mb-2 group-hover:scale-105 transition-transform bg-slate-100" /> Speakers</div>
                      <div className="text-[12px] text-center font-medium text-slate-700"><img src="https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400&q=80" referrerPolicy="no-referrer" className="w-full h-[90px] object-cover rounded-xl mb-2 group-hover:scale-105 transition-transform bg-slate-100" /> Headsets</div>
                    </div>
                    <h4 className="mt-5 text-[14px] font-bold text-amber-600 flex items-center gap-1 group-hover:text-amber-800">Explore <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></h4>
                  </div>
                </Link>

                {/* Block 4: Fashion */}
                <Link href="/" className="w-[100%] md:w-[47%] lg:w-[23%] no-underline group">
                  <div className="bg-white p-5 h-full flex flex-col justify-between shadow-sm border border-slate-200 rounded-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                    <h3 className="text-[17px] font-bold text-slate-800 mb-4">Fashion | 60% off</h3>
                    <div className="grid grid-cols-2 gap-3 mt-2 flex-grow">
                      <div className="text-[12px] text-center font-medium text-slate-700"><img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80" referrerPolicy="no-referrer" className="w-full h-[90px] object-cover rounded-xl mb-2 group-hover:scale-105 transition-transform bg-slate-100" /> Casuals</div>
                      <div className="text-[12px] text-center font-medium text-slate-700"><img src="https://images.unsplash.com/photo-1594938291221-94f18cbb5660?w=400&q=80" referrerPolicy="no-referrer" className="w-full h-[90px] object-cover rounded-xl mb-2 group-hover:scale-105 transition-transform bg-slate-100" /> Formals</div>
                      <div className="text-[12px] text-center font-medium text-slate-700"><img src="https://images.unsplash.com/photo-1533313264027-ec1be93c78ce?w=400&q=80" referrerPolicy="no-referrer" className="w-full h-[90px] object-cover rounded-xl mb-2 group-hover:scale-105 transition-transform bg-slate-100" /> Winter</div>
                      <div className="text-[12px] text-center font-medium text-slate-700"><img src="https://images.unsplash.com/photo-1523206489230-c012c64b2b48?w=400&q=80" referrerPolicy="no-referrer" className="w-full h-[90px] object-cover rounded-xl mb-2 group-hover:scale-105 transition-transform bg-slate-100" /> Extras</div>
                    </div>
                    <h4 className="mt-5 text-[14px] font-bold text-pink-600 flex items-center gap-1 group-hover:text-pink-800">Explore <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></h4>
                  </div>
                </Link>

              </div>
            )}

            {/* ✅ RANDOMIZED HORIZONTAL SCROLL ROWS */}
            {selectedCategory === "All" && products.length > 0 && (
              <div className="mb-16">
                {/* Random slice 1 for Deals */}
                <HorizontalScrollRow 
                  title="Top Deals This Week" 
                  products={[...products].reverse().slice(0, 10)} 
                  accentColor="from-violet-500 to-fuchsia-500" 
                />
                {/* Random slice 2 for Home Essentials */}
                <HorizontalScrollRow 
                  title="Home Essentials" 
                  products={[...products].slice(10, 20)} 
                  accentColor="from-cyan-500 to-blue-500" 
                />
              </div>
            )}

          </div>
        )}

        {/* --- MAIN CONTENT SECTION --- */}
        <section className="main-section" style={{ marginTop: searchQuery ? '9rem' : '0' }}>
          <div className="section-header">
            <div>
              <h2 className="section-title">
                {searchQuery ? (
                   <>Results for <span className="text-indigo-600">"{searchQuery}"</span></>
                ) : (
                   <>{selectedCategory === "All" ? "Trending Now" : selectedCategory} <span className="hot-badge animate-pulse">Hot Deals</span></>
                )}
              </h2>
            </div>
            <span className="page-badge">
              Page {page} of {totalPages}
            </span>
          </div>

          {isLoading ? (
            <div className="product-grid">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="skeleton-card">
                  <div className="skeleton-img"></div>
                  <div className="skeleton-text w-50"></div>
                  <div className="skeleton-text w-25"></div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <div className="flex justify-center text-slate-300 mb-6"><SearchX size={64}/></div>
              <h2 className="empty-title">No products found</h2>
              <p className="empty-subtitle">Try adjusting your search or filter to find what you're looking for.</p>
              <button onClick={() => router.push(`/`)} className="clear-btn">
                Clear Search & Filters
              </button>
            </div>
          ) : (
            <>
              <div className="product-grid">
                {products.map((product: any) => (
                  <div key={product.id} className="transition-transform duration-300 hover:-translate-y-2">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>

              <div className="pagination-container">
                <button 
                  disabled={page === 1}
                  onClick={() => handlePageChange(Math.max(1, page - 1))}
                  className={`page-btn ${page === 1 ? "disabled" : "hover:border-indigo-300 hover:text-indigo-600"}`}
                >
                  <ArrowRight size={16} style={{ transform: 'rotate(180deg)' }} />
                  Prev
                </button>
                
                <div className="page-number">
                  {page} <span style={{ color: '#cbd5e1', margin: '0 0.25rem' }}>/</span> {totalPages}
                </div>

                <button 
                  disabled={page >= totalPages}
                  onClick={() => handlePageChange(page + 1)}
                  className={`page-btn next ${page >= totalPages ? "disabled" : "hover:shadow-lg hover:-translate-y-1 transition-all"}`}
                >
                  Next
                  <ArrowRight size={16} />
                </button>
              </div>
            </>
          )}
        </section>

        {/* --- FEATURES SECTION --- */}
        <section className="features-section">
          <div className="features-card relative overflow-hidden bg-white shadow-xl shadow-slate-200/50 border border-slate-100 rounded-[2.5rem] p-10 md:p-14">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-fuchsia-50 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-cyan-50 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="features-grid relative z-10">
              {[
                { title: "Instant Delivery", desc: "Get products delivered within 24 hours.", color: "violet", Icon: Zap },
                { title: "Secure Payments", desc: "100% secure payment gateway.", color: "fuchsia", Icon: Heart },
                { title: "24/7 Support", desc: "Dedicated support team for you.", color: "cyan", Icon: ShoppingBag }
              ].map((feature, i) => (
                <div key={i} className="feature-item group">
                  <div className={`feature-icon ${feature.color} transition-transform duration-300 group-hover:-translate-y-2 group-hover:shadow-md`}>
                    <feature.Icon size={32} strokeWidth={2.5} />
                  </div>
                  <h4 className="feature-title">{feature.title}</h4>
                  <p className="feature-desc">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <style jsx global>{`
        /* Blobs */
        @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-15px); } 100% { transform: translateY(0px); } }
        .blob { position: absolute; border-radius: 50%; filter: blur(120px); opacity: 0.3; animation: float 8s ease-in-out infinite; }
        .blob-1 { top: -10%; left: -10%; width: 60vw; height: 60vw; background: #c4b5fd; }
        .blob-2 { bottom: 10%; right: -10%; width: 50vw; height: 50vw; background: #67e8f9; animation-delay: 2s; }
        .blob-3 { top: 40%; left: 20%; width: 40vw; height: 40vw; background: #fbcfe8; }
        
        /* Category Scroll Container */
        .category-scroll-container { display: flex; gap: 0.5rem; overflow-x: auto; width: 100%; scrollbar-width: none; align-items: center; }
        .category-scroll-container::-webkit-scrollbar { display: none; }
        
        .category-btn { flex: 0 0 auto; white-space: nowrap; padding: 0.6rem 1.25rem; border-radius: 9999px; font-weight: 600; font-size: 0.9rem; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; border: none; background: #f1f5f9; color: #64748b; }
        .category-btn:hover:not(.active) { background: #e2e8f0; color: #334155; transform: scale(1.02) translateY(-1px); }
        .category-btn.active { background: #0f172a; color: #ffffff; box-shadow: 0 4px 10px rgba(15, 23, 42, 0.2); transform: scale(1.05); }

        /* Main Elements */
        .main-section { max-width: 1500px; margin: 0 auto; padding: 0 1rem 6rem; width: 100%; }
        .section-header { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 2rem; padding: 0 0.5rem; }
        .section-title { font-size: 1.875rem; font-weight: 800; color: #0f172a; display: flex; align-items: center; gap: 0.75rem; }
        .hot-badge { font-size: 0.875rem; font-weight: 600; color: #ef4444; background: #fee2e2; padding: 0.25rem 0.75rem; border-radius: 9999px; border: 1px solid #fecaca; }
        .page-badge { font-size: 0.875rem; font-weight: 600; color: #64748b; background: #ffffff; padding: 0.375rem 1rem; border-radius: 9999px; border: 1px solid #e2e8f0; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
        
        /* Grid */
        .product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1.5rem; }
        
        /* Pagination */
        .pagination-container { display: flex; justify-content: center; align-items: center; gap: 1rem; margin-top: 5rem; }
        .page-btn { padding: 0.875rem 1.5rem; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 9999px; font-weight: 700; color: #475569; cursor: pointer; transition: all 0.3s; display: flex; align-items: center; gap: 0.5rem; }
        .page-btn.next { background: #0f172a; color: #ffffff; border-color: transparent; }
        .page-btn.disabled { opacity: 0.5; cursor: not-allowed; }
        .page-number { padding: 0.875rem 1.5rem; background: #ffffff; color: #0f172a; font-weight: 700; border-radius: 9999px; border: 1px solid #e2e8f0; }
        
        /* Skeletons & Empty State */
        .skeleton-card { aspect-ratio: 3/4; background: #ffffff; border-radius: 1.5rem; border: 1px solid #f1f5f9; padding: 1rem; animation: pulse 1.5s infinite; }
        .skeleton-img { width: 100%; height: 70%; background: #f1f5f9; border-radius: 1rem; margin-bottom: 1rem; }
        .skeleton-text { height: 1rem; background: #f1f5f9; border-radius: 0.25rem; margin-bottom: 0.5rem; }
        
        .empty-state { text-align: center; padding: 6rem 0; background: #ffffff; border-radius: 2rem; border: 1px solid #e2e8f0; }
        .empty-title { font-size: 1.5rem; font-weight: 700; color: #0f172a; margin-bottom: 0.5rem; }
        .empty-subtitle { color: #64748b; margin-bottom: 2rem; }
        .clear-btn { padding: 0.875rem 2rem; background: #0f172a; color: #ffffff; border-radius: 9999px; font-weight: 700; border: none; cursor: pointer; transition: all 0.3s; }
        .clear-btn:hover { background: #1e293b; box-shadow: 0 10px 15px -3px rgba(15, 23, 42, 0.2); }
        
        /* Features */
        .features-section { max-width: 1500px; margin: 0 auto; padding: 0 1.5rem 5rem; width: 100%; }
        .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3rem; text-align: center; }
        .feature-item { display: flex; flex-direction: column; align-items: center; }
        .feature-icon { width: 4.5rem; height: 4.5rem; border-radius: 1.25rem; display: flex; align-items: center; justify-content: center; margin-bottom: 1.25rem; }
        .feature-icon.violet { background: #f5f3ff; color: #7c3aed; }
        .feature-icon.fuchsia { background: #fdf4ff; color: #d946ef; }
        .feature-icon.cyan { background: #ecfeff; color: #06b6d4; }
        .feature-title { font-size: 1.125rem; font-weight: 800; color: #0f172a; margin-bottom: 0.5rem; }
        .feature-desc { color: #64748b; font-size: 0.95rem; max-width: 18rem; }
        
        /* Scrollbar Hide for Horizontal Rows */
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

        @media (max-width: 768px) {
          .features-grid { grid-template-columns: 1fr; gap: 2.5rem; }
          .product-grid { grid-template-columns: repeat(2, 1fr); gap: 1rem; }
          .page-badge { display: none; }
        }
      `}</style>
    </div>
  );
}

// ✅ HORIZONTAL SCROLL COMPONENT (FIXED IMAGES)
function HorizontalScrollRow({ title, products, accentColor }: { title: string, products: any[], accentColor: string }) {
  const rowProducts = Array.isArray(products) ? products.slice(0, 10) : [];

  if (rowProducts.length === 0) return null;

  return (
    <div className="bg-white relative mb-8 p-6 border border-slate-200 rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className={`absolute left-0 top-[30px] w-[6px] h-[35px] bg-gradient-to-b ${accentColor} rounded-r-md`}></div>
      
      <h2 className="text-[20px] font-extrabold text-slate-800 mb-6 pl-4 flex items-center justify-between">
        {title}
        <Link href="/" className="text-[13px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 group bg-indigo-50 px-3 py-1.5 rounded-full">
          View All <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </h2>
      
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
        {rowProducts.map((p, idx) => {
          // Robust fallback logic for images from your backend API
          const imageSource = p.image || p.thumbnail || (p.images && p.images[0]) || "https://placehold.co/400x400/e2e8f0/64748b?text=No+Image";
          
          return (
            <Link key={idx} href={`/product/${p.id}`} className="snap-start shrink-0 w-[170px] bg-white rounded-2xl p-3 border border-slate-100 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-slate-200 flex flex-col justify-between group">
              <div className="bg-slate-50 rounded-xl p-2 mb-3 h-[130px] flex items-center justify-center overflow-hidden">
                 <img 
                   src={imageSource} 
                   referrerPolicy="no-referrer" // ✅ Bypass Hotlinking Blocks
                   onError={(e) => {
                     // Fallback just in case URL is broken
                     e.currentTarget.onerror = null; 
                     e.currentTarget.src = "https://placehold.co/400x400/e2e8f0/64748b?text=Error";
                   }}
                   className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 mix-blend-multiply" 
                   alt={p.title || "Product"} 
                 />
              </div>
              <p className="text-[13px] font-bold text-slate-700 line-clamp-2 leading-tight min-h-[36px] text-center px-1">
                {p.title || "Product Name"}
              </p>
            </Link>
          )
        })}
        
        {/* "See All" Card */}
        <Link href="/" className={`snap-start shrink-0 w-[170px] bg-gradient-to-br ${accentColor} text-white rounded-2xl p-4 flex flex-col items-center justify-center shadow-md hover:-translate-y-2 hover:shadow-xl transition-all group`}>
           <div className="bg-white/20 p-4 rounded-full mb-3 group-hover:scale-110 transition-transform">
             <ArrowRight size={28} />
           </div>
           <span className="font-bold text-[14px] uppercase tracking-wider text-center">See All<br/>Offers</span>
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

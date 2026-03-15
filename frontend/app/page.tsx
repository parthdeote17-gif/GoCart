"use client";

// ✅ 1. ADDED: This line fixes the Vercel prerendering error for pages using useSearchParams
export const dynamic = "force-dynamic";

import { useEffect, useState, Suspense, useRef } from "react"; 
import { getProducts, getCategories, getRecommendations } from "@/services/product.service";
import Link from "next/link";
import { ArrowRight, Heart, ShoppingBag, Zap, ChevronLeft, ChevronRight, SearchX, FilterX, ChevronDown } from "lucide-react"; 
import { useRouter, useSearchParams } from "next/navigation"; 
import ProductCard from "@/components/ProductCard"; 
import { useQuery } from "@tanstack/react-query"; 

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

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

  const urlMinPrice = searchParams.get("min") || "";
  const urlMaxPrice = searchParams.get("max") || "";

  const [minPriceInput, setMinPriceInput] = useState(urlMinPrice);
  const [maxPriceInput, setMaxPriceInput] = useState(urlMaxPrice);
  const [isPriceDropdownOpen, setIsPriceDropdownOpen] = useState(false);
  const priceDropdownRef = useRef<HTMLDivElement>(null);

  const [categories, setCategories] = useState<any[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  // ✅ FIX: Hydration error se bachne ke liye token ko state mein rakha
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setHasToken(!!localStorage.getItem("token"));
    }
  }, []);

  const isRandomFeed = !searchQuery && !urlMinPrice && !urlMaxPrice; 

  // =====================================================================
  // ✅ 1. MAIN GRID CALL (Hamesha limit 30, jisse pagination stable rahe)
  // =====================================================================
  const { data: mainData, isLoading } = useQuery({
    queryKey: ['mainProducts', selectedCategory, page, searchQuery, isRandomFeed, urlMinPrice, urlMaxPrice], 
    queryFn: () => getProducts(selectedCategory, page, 30, searchQuery, isRandomFeed, urlMinPrice, urlMaxPrice), 
    staleTime: 5 * 60 * 1000, 
  });

  const displayMainGrid = mainData?.products || [];
  const totalPages = mainData?.pagination?.totalPages || 1;

  // =====================================================================
  // ✅ 2. BANNER CALL (Sirf page 1 pe, Fetch 40 items taaki View All kaam kare!)
  // =====================================================================
  const showBanners = selectedCategory === "All" && page === 1 && isRandomFeed;
  
  const { data: bannerData } = useQuery({
    queryKey: ['bannerProducts', selectedCategory], 
    queryFn: () => getProducts(selectedCategory, 1, 40, "", true, "", ""), 
    staleTime: 5 * 60 * 1000, 
    enabled: showBanners 
  });

  const bannerProducts = bannerData?.products || [];
  
  // ✅ DYNAMIC SPLIT
  const splitIndex = Math.floor(bannerProducts.length / 2);
  const displayTopDeals = bannerProducts.slice(0, splitIndex);
  const displayFeatured = bannerProducts.slice(splitIndex, bannerProducts.length);

  // =====================================================================
  // ✅ 3. ML RECOMMENDATIONS CALL (Real-Time Update Fix)
  // =====================================================================
  const { data: recommendedData } = useQuery({
    queryKey: ['recommendedProducts', hasToken], 
    queryFn: getRecommendations, 
    staleTime: 0,               // 👈 FIX: Puraana data cache nahi karega
    refetchOnMount: true,       // 👈 FIX: Page load hote hi turant naya data layega
    refetchOnWindowFocus: true, // 👈 FIX: Tab switch karke wapas aane pe update hoga
    enabled: showBanners && hasToken 
  });

  const recommendedProducts = recommendedData || [];

  // =====================================================================

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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (priceDropdownRef.current && !priceDropdownRef.current.contains(event.target as Node)) {
        setIsPriceDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + sliderImages.length) % sliderImages.length);

  // ✅ COMMON SCROLL FUNCTION ADDED HERE
  const scrollToGrid = () => {
    setTimeout(() => {
      const productSection = document.getElementById('product-grid-start');
      if (productSection) {
        const yOffset = -80; 
        const y = productSection.getBoundingClientRect().top + window.scrollY + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);
  };

  const isMounted = useRef(false);

  // ✅ NAVBAR SEARCH SUGGESTION YA CATEGORY CLICK HONE PE SCROLL
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      if (searchQuery) {
        scrollToGrid();
      }
      return;
    }
    scrollToGrid();
  }, [searchQuery, selectedCategory]);

  const updateFilters = (cat: string, newPage: number, min?: string, max?: string) => {
    const params = new URLSearchParams();
    if (cat !== "All") params.append("category", cat);
    if (searchQuery) params.append("search", searchQuery);
    
    const finalMin = min !== undefined ? min : urlMinPrice;
    const finalMax = max !== undefined ? max : urlMaxPrice;
    
    if (finalMin) params.append("min", finalMin);
    if (finalMax) params.append("max", finalMax);
    
    params.append("page", newPage.toString()); 
    router.push(`/?${params.toString()}`);
  };

  const handleCategoryChange = (cat: string) => {
    updateFilters(cat, 1);
    scrollToGrid(); 
  };

  const handlePageChange = (newPage: number) => {
    updateFilters(selectedCategory, newPage);
    scrollToGrid(); 
  };

  const applyPriceFilter = () => {
    updateFilters(selectedCategory, 1, minPriceInput, maxPriceInput);
    scrollToGrid(); 
  };
  
  const clearPriceFilter = () => {
    setMinPriceInput("");
    setMaxPriceInput("");
    updateFilters(selectedCategory, 1, "", "");
    scrollToGrid(); 
  };

  const applyPreset = (min: string, max: string) => {
    setMinPriceInput(min);
    setMaxPriceInput(max);
    updateFilters(selectedCategory, 1, min, max);
    setIsPriceDropdownOpen(false);
    scrollToGrid(); 
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
            <div className="relative w-full h-[300px] md:h-[500px] overflow-hidden mb-12 mx-auto rounded-3xl shadow-xl group bg-slate-900">
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

            {/* ✅ CATEGORY SLIDER */}
            <div className="w-full mb-14 relative px-2">
              <div className="max-w-[1300px] mx-auto bg-white rounded-full shadow-md border border-slate-100 p-3 overflow-hidden relative">
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
                <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-white to-transparent pointer-events-none rounded-r-full"></div>
                <div className="absolute left-0 top-0 h-full w-12 bg-gradient-to-r from-white to-transparent pointer-events-none rounded-l-full"></div>
              </div>
            </div>

            {/* ✅ PROMOTIONAL BLOCKS */}
            {selectedCategory === "All" && (
              <div className="flex flex-wrap justify-center items-stretch gap-6 mb-16 px-2">
                
                {/* --- BLOCK 1: HOME (Teal Theme) --- */}
                <Link href="/" className="w-[100%] md:w-[47%] lg:w-[23%] no-underline relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-emerald-600 rounded-[32px] blur-xl opacity-0 group-hover:opacity-25 transition-opacity duration-700"></div>
                  
                  <div className="relative bg-white p-4 h-full flex flex-col shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 rounded-[32px] transition-transform duration-500 hover:-translate-y-2">
                    <div className="flex justify-between items-center mb-5 px-2 pt-2">
                      <h3 className="text-[19px] font-black text-slate-900 tracking-tight leading-none">Revamp your home</h3>
                    </div>

                    <div className="flex flex-col gap-2 flex-grow">
                      <div className="grid grid-cols-5 gap-2 h-[115px]">
                        <div className="col-span-3 relative rounded-2xl overflow-hidden group/img">
                          <img src="https://icmedianew.gumlet.io/pub/media/catalog/product/cache/7c90eecf75182456ca0a208cc3917af8/52121512SD02347/India-Circus-By-Krsnaa-Mehta-Blaue-Blume-Cushion-Cover-Set-of-2-52121512SD02347-1.jpg" referrerPolicy="no-referrer" className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110" alt="Cushions" />
                          <div className="absolute inset-0 bg-black/10 group-hover/img:bg-black/30 transition-colors duration-500"></div>
                          <div className="absolute bottom-2 left-2 backdrop-blur-md bg-black/30 border border-white/20 text-white text-[10px] uppercase tracking-wide font-bold px-3 py-1.5 rounded-full">Cushions</div>
                        </div>
                        <div className="col-span-2 relative rounded-2xl overflow-hidden group/img">
                          <img src="https://images.unsplash.com/photo-1544457070-4cd773b4d71e?w=400&q=80" referrerPolicy="no-referrer" className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110" alt="Decor" />
                          <div className="absolute inset-0 bg-black/10 group-hover/img:bg-black/30 transition-colors duration-500"></div>
                          <div className="absolute bottom-2 left-2 backdrop-blur-md bg-black/30 border border-white/20 text-white text-[10px] uppercase tracking-wide font-bold px-3 py-1.5 rounded-full">Decor</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-5 gap-2 h-[115px]">
                        <div className="col-span-2 relative rounded-2xl overflow-hidden group/img">
                          <img src="https://m.media-amazon.com/images/I/717gcN7j0nL._AC_UF894,1000_QL80_.jpg" referrerPolicy="no-referrer" className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110" alt="Storage" />
                          <div className="absolute inset-0 bg-black/10 group-hover/img:bg-black/30 transition-colors duration-500"></div>
                          <div className="absolute bottom-2 left-2 backdrop-blur-md bg-black/30 border border-white/20 text-white text-[10px] uppercase tracking-wide font-bold px-3 py-1.5 rounded-full">Storage</div>
                        </div>
                        <div className="col-span-3 relative rounded-2xl overflow-hidden group/img">
                          <img src="https://woodshells.co.in/wp-content/uploads/2025/05/A37I3769-min-scaled-e1672155249110.jpg" referrerPolicy="no-referrer" className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110" alt="Lighting" />
                          <div className="absolute inset-0 bg-black/10 group-hover/img:bg-black/30 transition-colors duration-500"></div>
                          <div className="absolute bottom-2 left-2 backdrop-blur-md bg-black/30 border border-white/20 text-white text-[10px] uppercase tracking-wide font-bold px-3 py-1.5 rounded-full">Lighting</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* --- BLOCK 2: APPLIANCES (Indigo Theme) --- */}
                <Link href="/" className="w-[100%] md:w-[47%] lg:w-[23%] no-underline relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-violet-600 rounded-[32px] blur-xl opacity-0 group-hover:opacity-25 transition-opacity duration-700"></div>
                  <div className="relative bg-white p-4 h-full flex flex-col shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 rounded-[32px] transition-transform duration-500 hover:-translate-y-2">
                    <div className="flex justify-between items-center mb-5 px-2 pt-2">
                      <h3 className="text-[19px] font-black text-slate-900 tracking-tight leading-none">Appliances</h3>
                    </div>
                    <div className="flex flex-col gap-2 flex-grow">
                      <div className="grid grid-cols-5 gap-2 h-[115px]">
                        <div className="col-span-2 relative rounded-2xl overflow-hidden group/img">
                          <img src="https://enciser.com/wp-content/uploads/2025/05/Top-10-1.5-ton-split-ac.jpg" referrerPolicy="no-referrer" className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110" alt="ACs" />
                          <div className="absolute inset-0 bg-black/10 group-hover/img:bg-black/30 transition-colors duration-500"></div>
                          <div className="absolute bottom-2 left-2 backdrop-blur-md bg-black/30 border border-white/20 text-white text-[10px] uppercase tracking-wide font-bold px-3 py-1.5 rounded-full">ACs</div>
                        </div>
                        <div className="col-span-3 relative rounded-2xl overflow-hidden group/img">
                          <img src="https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=400&q=80" referrerPolicy="no-referrer" className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110" alt="Washers" />
                          <div className="absolute inset-0 bg-black/10 group-hover/img:bg-black/30 transition-colors duration-500"></div>
                          <div className="absolute bottom-2 left-2 backdrop-blur-md bg-black/30 border border-white/20 text-white text-[10px] uppercase tracking-wide font-bold px-3 py-1.5 rounded-full">Washers</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-5 gap-2 h-[115px]">
                        <div className="col-span-3 relative rounded-2xl overflow-hidden group/img">
                          <img src="https://www.livemint.com/lm-img/img/2026/01/07/600x338/microwave_1767784659800_1767784666886.png" referrerPolicy="no-referrer" className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110" alt="Microwaves" />
                          <div className="absolute inset-0 bg-black/10 group-hover/img:bg-black/30 transition-colors duration-500"></div>
                          <div className="absolute bottom-2 left-2 backdrop-blur-md bg-black/30 border border-white/20 text-white text-[10px] uppercase tracking-wide font-bold px-3 py-1.5 rounded-full">Microwaves</div>
                        </div>
                        <div className="col-span-2 relative rounded-2xl overflow-hidden group/img">
                          <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSiP1QX0egv6r5jecOBz4Yt6TLM1CUAkCVSJw&s" referrerPolicy="no-referrer" className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110" alt="Fridges" />
                          <div className="absolute inset-0 bg-black/10 group-hover/img:bg-black/30 transition-colors duration-500"></div>
                          <div className="absolute bottom-2 left-2 backdrop-blur-md bg-black/30 border border-white/20 text-white text-[10px] uppercase tracking-wide font-bold px-3 py-1.5 rounded-full">Fridges</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* --- BLOCK 3: MOBILES (Amber Theme) --- */}
                <Link href="/" className="w-[100%] md:w-[47%] lg:w-[23%] no-underline relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-amber-500 rounded-[32px] blur-xl opacity-0 group-hover:opacity-25 transition-opacity duration-700"></div>
                  <div className="relative bg-white p-4 h-full flex flex-col shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 rounded-[32px] transition-transform duration-500 hover:-translate-y-2">
                    <div className="flex justify-between items-center mb-5 px-2 pt-2">
                      <h3 className="text-[19px] font-black text-slate-900 tracking-tight leading-none">Latest Mobiles</h3>
                    </div>
                    <div className="flex flex-col gap-2 flex-grow">
                      <div className="grid grid-cols-5 gap-2 h-[115px]">
                        <div className="col-span-3 relative rounded-2xl overflow-hidden group/img">
                          <img src="https://cdn.mos.cms.futurecdn.net/aFZoQKNZwEnee8m63KTyeD.jpg" referrerPolicy="no-referrer" className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110" alt="Phones" />
                          <div className="absolute inset-0 bg-black/10 group-hover/img:bg-black/30 transition-colors duration-500"></div>
                          <div className="absolute bottom-2 left-2 backdrop-blur-md bg-black/30 border border-white/20 text-white text-[10px] uppercase tracking-wide font-bold px-3 py-1.5 rounded-full">Phones</div>
                        </div>
                        <div className="col-span-2 relative rounded-2xl overflow-hidden group/img">
                          <img src="https://ambraneindia.com/cdn/shop/products/earbuds-with-noise-cancellation.png?v=1763459908&width=300" referrerPolicy="no-referrer" className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110" alt="Buds" />
                          <div className="absolute inset-0 bg-black/10 group-hover/img:bg-black/30 transition-colors duration-500"></div>
                          <div className="absolute bottom-2 left-2 backdrop-blur-md bg-black/30 border border-white/20 text-white text-[10px] uppercase tracking-wide font-bold px-3 py-1.5 rounded-full">Buds</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-5 gap-2 h-[115px]">
                        <div className="col-span-2 relative rounded-2xl overflow-hidden group/img">
                          <img src="https://helios-i.mashable.com/imagery/reviews/06Nb9YbigJ8aBaCuqhpyFsf/hero-image.fill.size_1248x702.v1712801670.jpg" referrerPolicy="no-referrer" className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110" alt="Speakers" />
                          <div className="absolute inset-0 bg-black/10 group-hover/img:bg-black/30 transition-colors duration-500"></div>
                          <div className="absolute bottom-2 left-2 backdrop-blur-md bg-black/30 border border-white/20 text-white text-[10px] uppercase tracking-wide font-bold px-3 py-1.5 rounded-full">Speakers</div>
                        </div>
                        <div className="col-span-3 relative rounded-2xl overflow-hidden group/img">
                          <img src="https://cdn.shopify.com/s/files/1/0057/8938/4802/files/LR_480.png?v=1733741345&width=400" referrerPolicy="no-referrer" className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110" alt="Headsets" />
                          <div className="absolute inset-0 bg-black/10 group-hover/img:bg-black/30 transition-colors duration-500"></div>
                          <div className="absolute bottom-2 left-2 backdrop-blur-md bg-black/30 border border-white/20 text-white text-[10px] uppercase tracking-wide font-bold px-3 py-1.5 rounded-full">Headsets</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* --- BLOCK 4: FASHION (Rose Theme) --- */}
                <Link href="/" className="w-[100%] md:w-[47%] lg:w-[23%] no-underline relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-rose-400 to-pink-600 rounded-[32px] blur-xl opacity-0 group-hover:opacity-25 transition-opacity duration-700"></div>
                  <div className="relative bg-white p-4 h-full flex flex-col shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 rounded-[32px] transition-transform duration-500 hover:-translate-y-2">
                    <div className="flex justify-between items-center mb-5 px-2 pt-2">
                      <h3 className="text-[19px] font-black text-slate-900 tracking-tight leading-none">Fashion</h3>
                    </div>
                    <div className="flex flex-col gap-2 flex-grow">
                      <div className="grid grid-cols-5 gap-2 h-[115px]">
                        <div className="col-span-2 relative rounded-2xl overflow-hidden group/img">
                          <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80" referrerPolicy="no-referrer" className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110" alt="Casuals" />
                          <div className="absolute inset-0 bg-black/10 group-hover/img:bg-black/30 transition-colors duration-500"></div>
                          <div className="absolute bottom-2 left-2 backdrop-blur-md bg-black/30 border border-white/20 text-white text-[10px] uppercase tracking-wide font-bold px-3 py-1.5 rounded-full">Casuals</div>
                        </div>
                        <div className="col-span-3 relative rounded-2xl overflow-hidden group/img">
                          <img src="https://images.unsplash.com/photo-1594938291221-94f18cbb5660?w=400&q=80" referrerPolicy="no-referrer" className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110" alt="Formals" />
                          <div className="absolute inset-0 bg-black/10 group-hover/img:bg-black/30 transition-colors duration-500"></div>
                          <div className="absolute bottom-2 left-2 backdrop-blur-md bg-black/30 border border-white/20 text-white text-[10px] uppercase tracking-wide font-bold px-3 py-1.5 rounded-full">Formals</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-5 gap-2 h-[115px]">
                        <div className="col-span-3 relative rounded-2xl overflow-hidden group/img">
                          <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjBqsduwbeqzp4dH4IQQw4i-zhaDTfagAoyQ&s" referrerPolicy="no-referrer" className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110" alt="Winter" />
                          <div className="absolute inset-0 bg-black/10 group-hover/img:bg-black/30 transition-colors duration-500"></div>
                          <div className="absolute bottom-2 left-2 backdrop-blur-md bg-black/30 border border-white/20 text-white text-[10px] uppercase tracking-wide font-bold px-3 py-1.5 rounded-full">Winter</div>
                        </div>
                        <div className="col-span-2 relative rounded-2xl overflow-hidden group/img">
                          <img src="https://www.networksolutions.com/blog/wp-content/uploads/2025/03/Products-to-sell-online-1.png" referrerPolicy="no-referrer" className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110" alt="Extras" />
                          <div className="absolute inset-0 bg-black/10 group-hover/img:bg-black/30 transition-colors duration-500"></div>
                          <div className="absolute bottom-2 left-2 backdrop-blur-md bg-black/30 border border-white/20 text-white text-[10px] uppercase tracking-wide font-bold px-3 py-1.5 rounded-full">Extras</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>

              </div>
            )}

            {/* ✅ BANNERS WITH NEW DYNAMIC ARRAY DATA & ML RECOMMENDATIONS */}
            {showBanners && (
              <div className="mb-16">
                
                {/* 🌟 NEW: ML Recommendation Row 🌟 */}
                {recommendedProducts.length > 0 && (
                  <HorizontalScrollRow 
                    title="Recommended For You" 
                    products={recommendedProducts} 
                    accentColor="from-amber-400 to-orange-500" 
                  />
                )}

                {displayTopDeals.length > 0 && (
                  <HorizontalScrollRow 
                    title="Top Deals This Week" 
                    products={displayTopDeals} 
                    accentColor="from-violet-500 to-fuchsia-500" 
                  />
                )}
                
                {displayFeatured.length > 0 && (
                  <HorizontalScrollRow 
                    title="Featured Products" 
                    products={displayFeatured} 
                    accentColor="from-cyan-500 to-blue-500" 
                  />
                )}
              </div>
            )}

          </div>
        )}

        {/* --- MAIN CONTENT SECTION --- */}
        <section id="product-grid-start" className="main-section" style={{ marginTop: searchQuery ? '9rem' : '0' }}>
          
          <div className="section-header" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '2rem', padding: '0 0.5rem' }}>
            
            <div>
              <h2 className="section-title" style={{ fontSize: '1.875rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {searchQuery ? (
                   <>Results for <span className="text-indigo-600">"{searchQuery}"</span></>
                ) : urlMinPrice || urlMaxPrice ? (
                   <>Filtered Products</>
                ) : (
                   <>{selectedCategory === "All" ? "Trending Now" : selectedCategory}</>
                )}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              
              {/* PRICE FILTER DROPDOWN */}
              <div className="relative" ref={priceDropdownRef}>
                <button 
                  onClick={() => setIsPriceDropdownOpen(!isPriceDropdownOpen)}
                  className="flex items-center gap-2 bg-white rounded-full shadow-sm border border-slate-200 py-2 px-4 hover:bg-slate-50 transition-colors"
                >
                  <span className="text-sm font-bold text-slate-700">
                    {(urlMinPrice || urlMaxPrice) 
                      ? `₹${urlMinPrice || 0} - ${urlMaxPrice ? '₹' + urlMaxPrice : 'Any'}` 
                      : "Price Filter"}
                  </span>
                  <ChevronDown size={16} className={`text-slate-500 transition-transform duration-300 ${isPriceDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {isPriceDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-3xl shadow-xl border border-slate-100 p-5 z-50 animate-in fade-in slide-in-from-top-2">
                    
                    <div className="mb-5">
                      <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Predefined Ranges</h4>
                      <div className="flex flex-col gap-1.5">
                        <button onClick={() => applyPreset("0", "500")} className="text-left text-sm font-bold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 py-2 px-3 rounded-xl transition-colors">Under ₹500</button>
                        <button onClick={() => applyPreset("500", "1000")} className="text-left text-sm font-bold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 py-2 px-3 rounded-xl transition-colors">₹500 - ₹1000</button>
                        <button onClick={() => applyPreset("1000", "5000")} className="text-left text-sm font-bold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 py-2 px-3 rounded-xl transition-colors">₹1000 - ₹5000</button>
                        <button onClick={() => applyPreset("5000", "")} className="text-left text-sm font-bold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 py-2 px-3 rounded-xl transition-colors">Over ₹5000</button>
                      </div>
                    </div>

                    <div className="h-px bg-slate-100 w-full mb-5"></div>

                    <div>
                      <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Custom Range</h4>
                      <div className="flex items-center gap-2 mb-4">
                        <input 
                          type="number" 
                          placeholder="Min" 
                          value={minPriceInput}
                          onChange={(e) => setMinPriceInput(e.target.value)}
                          className="w-full p-2.5 text-sm font-bold bg-slate-50 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 focus:bg-white transition-all text-center"
                        />
                        <span className="text-slate-300 font-bold">-</span>
                        <input 
                          type="number" 
                          placeholder="Max" 
                          value={maxPriceInput}
                          onChange={(e) => setMaxPriceInput(e.target.value)}
                          className="w-full p-2.5 text-sm font-bold bg-slate-50 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 focus:bg-white transition-all text-center"
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <button 
                          onClick={() => { applyPriceFilter(); setIsPriceDropdownOpen(false); }} 
                          className="flex-1 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-indigo-600 transition-colors shadow-md hover:shadow-lg"
                        >
                          Apply
                        </button>
                        {(urlMinPrice || urlMaxPrice) && (
                          <button 
                            onClick={() => { clearPriceFilter(); setIsPriceDropdownOpen(false); }} 
                            className="p-2.5 text-red-500 bg-red-50 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm" 
                            title="Clear Filter"
                          >
                            <FilterX size={18} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Page Badge */}
              <span className="page-badge whitespace-nowrap" style={{ fontSize: '0.875rem', fontWeight: '600', color: '#64748b', background: '#ffffff', padding: '0.5rem 1rem', borderRadius: '9999px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                Page {page} of {totalPages}
              </span>

            </div>
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
          ) : displayMainGrid.length === 0 ? (
            <div className="empty-state">
              <div className="flex justify-center text-slate-300 mb-6"><SearchX size={64}/></div>
              <h2 className="empty-title">No products found</h2>
              <p className="empty-subtitle">Try adjusting your search or filter to find what you're looking for.</p>
              <button 
                onClick={() => {
                  clearPriceFilter();
                  router.push(`/`);
                }} 
                className="clear-btn"
              >
                Clear Search & Filters
              </button>
            </div>
          ) : (
            <>
              <div className="product-grid">
                {displayMainGrid.map((product: any) => (
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
        
        .category-scroll-container { display: flex; gap: 0.75rem; overflow-x: auto; width: 100%; scrollbar-width: none; align-items: center; padding: 0.25rem; }
        .category-scroll-container::-webkit-scrollbar { display: none; }
        
        .category-btn { flex: 0 0 auto; white-space: nowrap; padding: 0.8rem 1.75rem; border-radius: 9999px; font-weight: 600; font-size: 1.05rem; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; border: none; background: #f1f5f9; color: #64748b; }
        .category-btn:hover:not(.active) { background: #e2e8f0; color: #334155; transform: scale(1.02) translateY(-1px); }
        .category-btn.active { background: #0f172a; color: #ffffff; box-shadow: 0 4px 10px rgba(15, 23, 42, 0.2); transform: scale(1.05); }

        .main-section { max-width: 1500px; margin: 0 auto; padding: 0 1rem 6rem; width: 100%; }
        .product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1.5rem; }
        
        .pagination-container { display: flex; justify-content: center; align-items: center; gap: 1rem; margin-top: 5rem; }
        .page-btn { padding: 0.875rem 1.5rem; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 9999px; font-weight: 700; color: #475569; cursor: pointer; transition: all 0.3s; display: flex; align-items: center; gap: 0.5rem; }
        .page-btn.next { background: #0f172a; color: #ffffff; border-color: transparent; }
        .page-btn.disabled { opacity: 0.5; cursor: not-allowed; }
        .page-number { padding: 0.875rem 1.5rem; background: #ffffff; color: #0f172a; font-weight: 700; border-radius: 9999px; border: 1px solid #e2e8f0; }
        
        .skeleton-card { aspect-ratio: 3/4; background: #ffffff; border-radius: 1.5rem; border: 1px solid #f1f5f9; padding: 1rem; animation: pulse 1.5s infinite; }
        .skeleton-img { width: 100%; height: 70%; background: #f1f5f9; border-radius: 1rem; margin-bottom: 1rem; }
        .skeleton-text { height: 1rem; background: #f1f5f9; border-radius: 0.25rem; margin-bottom: 0.5rem; }
        
        .empty-state { text-align: center; padding: 6rem 0; background: #ffffff; border-radius: 2rem; border: 1px solid #e2e8f0; }
        .empty-title { font-size: 1.5rem; font-weight: 700; color: #0f172a; margin-bottom: 0.5rem; }
        .empty-subtitle { color: #64748b; margin-bottom: 2rem; }
        .clear-btn { padding: 0.875rem 2rem; background: #0f172a; color: #ffffff; border-radius: 9999px; font-weight: 700; border: none; cursor: pointer; transition: all 0.3s; }
        .clear-btn:hover { background: #1e293b; box-shadow: 0 10px 15px -3px rgba(15, 23, 42, 0.2); }
        
        .features-section { max-width: 1500px; margin: 0 auto; padding: 0 1.5rem 5rem; width: 100%; }
        .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3rem; text-align: center; }
        .feature-item { display: flex; flex-direction: column; align-items: center; }
        .feature-icon { width: 4.5rem; height: 4.5rem; border-radius: 1.25rem; display: flex; align-items: center; justify-content: center; margin-bottom: 1.25rem; }
        .feature-icon.violet { background: #f5f3ff; color: #7c3aed; }
        .feature-icon.fuchsia { background: #fdf4ff; color: #d946ef; }
        .feature-icon.cyan { background: #ecfeff; color: #06b6d4; }
        .feature-title { font-size: 1.125rem; font-weight: 800; color: #0f172a; margin-bottom: 0.5rem; }
        .feature-desc { color: #64748b; font-size: 0.95rem; max-width: 18rem; }
        
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

        @media (max-width: 768px) {
          .features-grid { grid-template-columns: 1fr; gap: 2.5rem; }
          .product-grid { grid-template-columns: repeat(2, 1fr); gap: 1rem; }
        }
      `}</style>
    </div>
  );
}

// HORIZONTAL SCROLL COMPONENT (With Expand Logic)
function HorizontalScrollRow({ title, products, accentColor }: { title: string, products: any[], accentColor: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // ✅ FIX: Ab expand hone par array ke saare items dikhayega, warna sirf 10 dikhayega
  const displayLimit = isExpanded ? products.length : 10;
  const rowProducts = Array.isArray(products) ? products.slice(0, displayLimit) : [];

  if (rowProducts.length === 0) return null;

  // ✅ Button sirf tab aayega jab actual items 10 se zyada ho 
  const hasMore = products.length > 10;

  return (
    <div className="bg-white relative mb-8 p-6 border border-slate-200 rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className={`absolute left-0 top-[30px] w-[6px] h-[35px] bg-gradient-to-b ${accentColor} rounded-r-md`}></div>
      
      <h2 className="text-[20px] font-extrabold text-slate-800 mb-6 pl-4 flex items-center justify-between">
        {title}
        {hasMore && !isExpanded && (
          <button 
            onClick={() => setIsExpanded(true)} 
            className="text-[13px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 group bg-indigo-50 px-3 py-1.5 rounded-full cursor-pointer border-none outline-none"
          >
            View All <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        )}
      </h2>
      
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
        {rowProducts.map((p, idx) => {
          
          let imageSource = "";
          if (p?.images && Array.isArray(p.images) && p.images.length > 0) {
            imageSource = p.images[0];
          } else if (p?.image) {
            imageSource = p.image;
          } else if (p?.thumbnail) {
            imageSource = p.thumbnail;
          } else if (p?.img_url) {
            imageSource = p.img_url;
          } else if (p?.imgUrl) {
            imageSource = p.imgUrl;
          }

          if (imageSource && !imageSource.startsWith("http")) {
            imageSource = `${BASE_URL}${imageSource}`;
          }
          
          return (
            <Link key={idx} href={`/product/${p.id}`} className="snap-start shrink-0 w-[170px] bg-white rounded-2xl p-3 border border-slate-100 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-slate-200 flex flex-col justify-between group">
              <div className="bg-slate-50 rounded-xl p-2 mb-3 h-[130px] flex items-center justify-center overflow-hidden">
                 {imageSource && (
                   <img 
                     src={imageSource} 
                     referrerPolicy="no-referrer" 
                     className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 mix-blend-multiply" 
                     alt={p.title || "Product"} 
                     onError={(e) => { e.currentTarget.style.display = "none"; }}
                   />
                 )}
              </div>
              <p className="text-[13px] font-bold text-slate-700 line-clamp-2 leading-tight min-h-[36px] text-center px-1">
                {p.title || "Product Name"}
              </p>
            </Link>
          )
        })}
        
        {hasMore && !isExpanded && (
          <button 
            onClick={() => setIsExpanded(true)} 
            className={`cursor-pointer border-none outline-none snap-start shrink-0 w-[170px] bg-gradient-to-br ${accentColor} text-white rounded-2xl p-4 flex flex-col items-center justify-center shadow-md hover:-translate-y-2 hover:shadow-xl transition-all group`}
          >
             <div className="bg-white/20 p-4 rounded-full mb-3 group-hover:scale-110 transition-transform">
               <ArrowRight size={28} />
             </div>
             <span className="font-bold text-[14px] uppercase tracking-wider text-center">See All<br/>Offers</span>
          </button>
        )}
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
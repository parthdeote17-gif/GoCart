"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, Suspense } from "react"; 
import { getProducts, getCategories } from "@/services/product.service";
import Link from "next/link";
import { ArrowRight, Heart, ShoppingBag, Zap, ChevronLeft, ChevronRight, SearchX } from "lucide-react"; 
import { useRouter, useSearchParams } from "next/navigation"; 
import ProductCard from "@/components/ProductCard"; 
import { useQuery } from "@tanstack/react-query"; 

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

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
    <div className="relative min-h-screen bg-[#f8fafc] text-[#0f172a] overflow-x-hidden">

      {/* --- SLIDER --- */}
      {!searchQuery && (
        <div className="max-w-[1500px] mx-auto px-4 pt-28">
          <div className="relative w-full h-[300px] md:h-[500px] overflow-hidden mb-10 rounded-3xl shadow-xl bg-slate-900">
            {sliderImages.map((img, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-all duration-1000 ${
                  index === currentSlide ? "opacity-100" : "opacity-0"
                }`}
              >
                <img src={img} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- PRODUCT GRID --- */}
      <section className="main-section">
        {isLoading ? (
          <div className="product-grid">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="skeleton-card"></div>
            ))}
          </div>
        ) : (
          <div className="product-grid">
            {products.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* --- HORIZONTAL ROW --- */}
      {selectedCategory === "All" && products.length > 0 && (
        <HorizontalScrollRow
          title="Top Deals This Week"
          products={[...products].slice(0, 10)}
          accentColor="from-violet-500 to-fuchsia-500"
        />
      )}
    </div>
  );
}

/* ========================= */
/* UPDATED HORIZONTAL ROW */
/* ========================= */

function HorizontalScrollRow({ title, products, accentColor }: any) {

  const rowProducts = Array.isArray(products) ? products : [];

  if (rowProducts.length === 0) return null;

  return (
    <div className="bg-white mb-8 p-6 rounded-3xl border border-slate-200">
      <h2 className="text-xl font-bold mb-6">{title}</h2>

      <div className="flex gap-4 overflow-x-auto pb-4">

        {rowProducts.map((p: any, idx: number) => {

          /* ✅ Proper dataset image extraction */
          let imageSource = "";

          if (p?.images && Array.isArray(p.images) && p.images.length > 0) {
            imageSource = p.images[0];
          } else if (p?.image) {
            imageSource = p.image;
          } else if (p?.image_url) {
            imageSource = p.image_url;
          } else if (p?.imgUrl) {
            imageSource = p.imgUrl;
          } else if (p?.thumbnail) {
            imageSource = p.thumbnail;
          }

          /* ✅ Relative path fix */
          if (imageSource && !imageSource.startsWith("http")) {
            imageSource = `${BASE_URL}${imageSource}`;
          }

          return (
            <Link
              key={idx}
              href={`/product/${p.id}`}
              className="w-[170px] shrink-0 bg-white rounded-2xl p-3 border border-slate-100"
            >
              <div className="h-[130px] flex items-center justify-center overflow-hidden">
                {imageSource && (
                  <img
                    src={imageSource}
                    alt={p.title}
                    className="w-full h-full object-contain transition-transform duration-500 hover:scale-110"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                )}
              </div>

              <p className="text-sm font-semibold mt-2 text-center line-clamp-2">
                {p.title}
              </p>
            </Link>
          );
        })}

      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}

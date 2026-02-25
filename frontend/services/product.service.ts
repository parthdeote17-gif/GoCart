import { apiFetch } from "./api";

export interface Product {
  id: number;
  title: string;
  price: string;
  img_url: string;
  category_name: string;
  stars: string;
  reviews: number;
  description?: string;
}

// ✅ Updated: Added 'minPrice' and 'maxPrice' for price filtering
export async function getProducts(
  category: string = "All", 
  page: number = 1, 
  limit: number = 20, 
  search: string = "",
  random: boolean = false, // 🆕 New Parameter
  minPrice?: string | null, // ✅ Price Filter parameter
  maxPrice?: string | null  // ✅ Price Filter parameter
) {
  try {
    const params = new URLSearchParams();

    if (category && category !== "All") {
      params.append("category", category);
    }
    
    // --- Search Logic ---
    if (search && search.trim() !== "") {
      params.append("search", search);
    }

    // ✅ Random Logic: Agar random true hai to backend ko batao
    if (random) {
      params.append("random", "true");
    }

    // ✅ Price Logic: Agar price limits hain to backend ko bhejo
    if (minPrice) {
      params.append("minPrice", minPrice);
    }
    if (maxPrice) {
      params.append("maxPrice", maxPrice);
    }
    
    params.append("page", page.toString());
    params.append("limit", limit.toString());

    // Backend return karega: { products: [], pagination: {} }
    return await apiFetch(`/products?${params.toString()}`);
  } catch (error) {
    console.error("Error fetching products:", error);
    // Crash bachane ke liye safe default return
    return { products: [], pagination: { totalPages: 1, currentPage: 1 } };
  }
}

export async function getCategories() {
  try {
    return await apiFetch("/products/categories");
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export async function getProductById(id: string | number) {
  try {
    return await apiFetch(`/products/${id}`);
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    throw error;
  }
}

// ✅ NEW FUNCTION: Fetch Related Products
export async function getRelatedProducts(id: string | number) {
  try {
    // Ye route backend mein humne abhi banaya hai: /api/products/:id/related
    return await apiFetch(`/products/${id}/related`);
  } catch (error) {
    console.error(`Error fetching related products for ${id}:`, error);
    return []; // Empty array return karo taaki UI crash na ho
  }
}

// ✅ NEW FUNCTION: Fetch Search Suggestions (Autocomplete ke liye)
export async function fetchSearchSuggestions(query: string) {
  if (!query) return [];
  try {
    // Ye backend ke naye route (/products/suggestions) ko call karega
    return await apiFetch(`/products/suggestions?q=${encodeURIComponent(query)}`);
  } catch (error) {
    console.error("Error fetching search suggestions:", error);
    return [];
  }
}

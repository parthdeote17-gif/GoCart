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

// Updated: Added 'minPrice' and 'maxPrice' for price filtering
export async function getProducts(
  category: string = "All", 
  page: number = 1, 
  limit: number = 20, 
  search: string = "",
  random: boolean = false, // 🆕 New Parameter
  minPrice?: string | null, // Price Filter parameter
  maxPrice?: string | null  // Price Filter parameter
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

    // Logic: Notify the backend if the random flag is set to true.
    if (random) {
      params.append("random", "true");
    }

    //Logic: Send the price limits to the backend if they are specified
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

// NEW FUNCTION: Fetch Related Products
export async function getRelatedProducts(id: string | number) {
  try {
    // New backend route: /api/products/:id/related
    return await apiFetch(`/products/${id}/related`);
  } catch (error) {
    console.error(`Error fetching related products for ${id}:`, error);
    return []; //Return an empty array to prevent the UI from crashing
  }
}

// New function: Fetch search suggestions for autocomplete
export async function fetchSearchSuggestions(query: string) {
  if (!query) return [];
  try {
    // Call the new backend route (/products/suggestions) to fetch search suggestions
    return await apiFetch(`/products/suggestions?q=${encodeURIComponent(query)}`);
  } catch (error) {
    console.error("Error fetching search suggestions:", error);
    return [];
  }
}

// ==========================================
//  NEW FUNCTION: Fetch ML Recommendations (Safe Version)
// ==========================================
export async function getRecommendations() {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    
    //Skip the API call and return an empty list if the user is not logged in
    if (!token) return [];

    const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    
    // Fix: Use the native fetch instead of apiFetch to prevent the red screen error
    const res = await fetch(`${BASE_URL}/products/recommendations`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    //Handle 400 and 500 backend errors gracefully by returning an empty list instead of crashing
    if (!res.ok) {
        console.warn("⚠️ Recommendations abhi ready nahi hain (API Error).");
        return []; 
    }

    const data = await res.json();
    return Array.isArray(data) ? data : [];
    
  } catch (error) {
    console.warn("⚠️ Recommendation fetch failed:", error);
    return []; // UI crash hone se bach jayega
  }
}

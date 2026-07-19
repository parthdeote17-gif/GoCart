// ==========================================
// CONFIGURATION (SMART SWITCH)
// ==========================================

// 1.Localhost URL (Used during local development)
const LOCAL_URL = "http://127.0.0.1:5000/api";

// 2. Production URL (Render deployment backend)
const PROD_URL = "https://gocart-6iyu.onrender.com/api";

//  AUTO-DETECTION: 


const BASE_URL = 
  process.env.NEXT_PUBLIC_API_URL || 
  (process.env.NODE_ENV === "development" ? LOCAL_URL : PROD_URL);

console.log(`🚀 API Running on: ${process.env.NODE_ENV === "development" ? "Local" : "Production"} | URL: ${BASE_URL}`);

/**
 * Common API fetch wrapper
 */
export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  // Securely retrieve the authentication token
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      //  Required for CORS and cookie-based authentication
      credentials: "include", 
      
      headers: {
        "Content-Type": "application/json",
        //  Added support to bypass the ngrok browser warning for future compatibility
        "ngrok-skip-browser-warning": "true",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    // Error Handling
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || `API Error: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error("❌ Fetch Error:", error);
    throw error;
  }
}

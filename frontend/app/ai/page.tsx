"use client";

import { useState, useEffect, useRef } from "react";
import { apiFetch } from "@/services/api";
import { getRecommendations } from "@/services/product.service";
import { addToCart } from "@/services/cart.service";
import { toggleWishlist } from "@/services/wishlist.service"; // ✅ FIXED: addToWishlist ki jagah toggleWishlist
import ProductCard from "@/components/ProductCard";
import { Sparkles, Send, Bot, User, ArrowLeft, Loader2, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link"; // ✅ NAYA: Login redirect ke liye

type ChatMessage = {
  role: string;
  text: string;
  products?: any[];
  actionMsg?: string;
};

export default function GoAIPage() {
  const router = useRouter();
  // Hydration mismatch avoid karne ke liye initial state empty rakhi hai
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [recommendedProducts, setRecommendedProducts] = useState<any[]>([]);
  
  // ✅ NAYA: Auth Check States
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // Ref for the container to apply smart scroll
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // 1. Initial Auth Check & Scroll To Top
  useEffect(() => {
    // ✅ FIX: Page load hote hi top par scroll karega
    window.scrollTo(0, 0);

    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
    setAuthLoading(false);
  }, []);

  // 2. Initial Load: Fetch recommendations and restore chat history from session (ONLY if logged in)
  useEffect(() => {
    if (!isLoggedIn) return; // Agar login nahi hai toh API call nahi karega

    const savedChats = sessionStorage.getItem("goAiChats");
    if (savedChats) {
      try {
        setMessages(JSON.parse(savedChats));
      } catch (e) {
        setMessages([{ role: "ai", text: "Hi! I am Go AI. Tell me, how can I help you with your shopping today?" }]);
      }
    } else {
      setMessages([{ role: "ai", text: "Hi! I am Go AI. Tell me, how can I help you with your shopping today?" }]);
    }

    getRecommendations()
      .then((data) => setRecommendedProducts(data || []))
      .catch(console.error);
  }, [isLoggedIn]);

  // 3. Persist chat history to session storage on update
  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem("goAiChats", JSON.stringify(messages));
    }
  }, [messages]);

  // 4. Smart Scroll: Scroll only the chat container when messages or loading state change
  useEffect(() => {
    // ✅ FIX: Smart scroll sirf tabhi chalega jab logged in ho
    if (isLoggedIn && chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages, loading, isLoggedIn]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setInput("");
    setLoading(true);

    try {
      const userStr = localStorage.getItem("user");
      const userId = userStr ? JSON.parse(userStr).id : "guest";

      const res = await apiFetch("/ai/chat", {
        method: "POST",
        body: JSON.stringify({ userId: String(userId), message: userMsg })
      });

      let actionStatus = "";
      if (res.action === "add_to_cart" && res.action_product_id) {
        try {
          await addToCart(res.action_product_id);
          actionStatus = "✅ Item added to your Cart!";
        } catch(err) { 
          actionStatus = "❌ Failed to add to cart. Please try again."; 
        }
      } 
      else if (res.action === "add_to_wishlist" && res.action_product_id) {
        try {
          await toggleWishlist(res.action_product_id); // ✅ FIXED Call
          actionStatus = "❤️ Item saved to your Wishlist!";
        } catch(err) { 
          actionStatus = "❌ Failed to add to wishlist. Please try again."; 
        }
      }

      setMessages((prev) => [
        ...prev, 
        { 
          role: "ai", 
          text: res.reply,
          products: res.products || [],
          actionMsg: actionStatus
        }
      ]);

    } catch (error) {
      setMessages((prev) => [...prev, { role: "ai", text: "Sorry, network connection mein issue hai ya server thoda busy hai." }]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Jab tak Auth check ho raha hai, tab tak blank page dikhao (flicker rokne ke liye)
  if (authLoading) return null;

  // ==========================================
  // 🚫 LOGGED OUT UI: Agar user login nahi hai
  // ==========================================
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
         {/* Background Blobs */}
         <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
           <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[100px] animate-pulse"></div>
           <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "2s" }}></div>
         </div>

         <div className="max-w-md w-full bg-white/80 backdrop-blur-xl border border-white/60 p-10 rounded-[2.5rem] shadow-xl text-center relative z-10">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-600">
                <Bot size={40} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-4">Meet Go AI Assistant</h1>
            <p className="text-slate-500 mb-8 leading-relaxed">Sign in to chat with your smart shopping partner and get personalized recommendations.</p>
            
            <div className="space-y-3">
              <Link href="/login" className="block">
                <button className="w-full bg-indigo-600 text-white hover:bg-indigo-700 py-3 rounded-xl font-bold shadow-lg shadow-indigo-500/30 transition-all">
                  Sign In
                </button>
              </Link>
              <Link href="/" className="block">
                <button className="w-full bg-white text-slate-900 border-2 border-slate-100 hover:border-slate-300 py-3 rounded-xl font-bold transition-all">
                  Explore Products
                </button>
              </Link>
            </div>
         </div>
      </div>
    );
  }

  // ==========================================
  // ✅ LOGGED IN UI: Original AI Chat Interface
  // ==========================================
  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900 pt-28 pb-10 relative overflow-hidden">
      
      {/* --- BACKGROUND BLOBS --- */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "2s" }}></div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 relative z-10">
        
        {/* --- HEADER --- */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.back()} className="p-2.5 bg-white rounded-xl shadow-sm hover:shadow-md text-slate-500 hover:text-indigo-600 transition-all">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <Sparkles size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">Go AI Assistant</h1>
              <p className="text-sm text-indigo-600 font-bold tracking-wide">YOUR SMART SHOPPING PARTNER</p>
            </div>
          </div>
        </div>

        {/* --- SPLIT SCREEN LAYOUT --- */}
        <div className="flex flex-col xl:flex-row gap-8 h-[calc(100vh-200px)] min-h-[600px]">
          
          {/* 💬 LEFT SIDE: CHAT INTERFACE */}
          <div className="flex-1 bg-white/80 backdrop-blur-2xl border border-white rounded-[2.5rem] shadow-xl flex flex-col overflow-hidden relative">
            
            {/* Added ref for smart scrolling */}
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    
                    <div className={`w-10 h-10 mt-1 shrink-0 rounded-full flex items-center justify-center shadow-md ${msg.role === "user" ? "bg-slate-900 text-white" : "bg-gradient-to-br from-indigo-500 to-purple-500 text-white"}`}>
                      {msg.role === "user" ? <User size={20} /> : <Bot size={20} />}
                    </div>

                    <div className="flex flex-col gap-3">
                      <div className={`p-4 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
                        msg.role === "user" 
                          ? "bg-slate-900 text-white rounded-tr-sm" 
                          : "bg-white border border-slate-100 text-slate-700 rounded-tl-sm"
                      }`}>
                        <span style={{ whiteSpace: "pre-wrap" }}>{msg.text}</span>
                      </div>

                      {msg.actionMsg && (
                        <div className="text-[13px] font-bold text-green-700 bg-green-50/80 py-2 px-4 rounded-xl self-start shadow-sm border border-green-200 backdrop-blur-sm animate-in fade-in slide-in-from-top-2">
                          {msg.actionMsg}
                        </div>
                      )}

                      {msg.products && msg.products.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1 w-full max-w-[500px]">
                          {msg.products.map(p => (
                            <div key={p.id} className="transform hover:-translate-y-1 transition-all duration-300">
                               <ProductCard product={p} />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white"><Bot size={20} /></div>
                    <div className="p-4 bg-white border border-slate-100 rounded-2xl rounded-tl-sm flex items-center gap-2 text-indigo-500 font-bold">
                      <Loader2 size={16} className="animate-spin" /> AI is thinking...
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 sm:p-6 bg-white/90 border-t border-slate-100">
              <form onSubmit={sendMessage} className="flex items-center gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Go AI about products, trends, or deals..."
                  className="flex-1 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-full py-4 px-6 outline-none transition-all text-slate-800 font-medium"
                />
                <button 
                  type="submit" 
                  disabled={!input.trim() || loading} 
                  className="w-14 h-14 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/30 transition-all active:scale-95 shrink-0"
                >
                  <Send size={20} className="ml-1" />
                </button>
              </form>
            </div>
          </div>

          {/* 🛍️ RIGHT SIDE: ML RECOMMENDATIONS */}
          <div className="xl:w-[500px] 2xl:w-[600px] flex flex-col h-full bg-white/60 backdrop-blur-xl border border-white rounded-[2.5rem] shadow-xl overflow-hidden">
            
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white shrink-0">
              <h3 className="text-xl font-bold flex items-center gap-2"><ShoppingBag size={20} /> Recommended For You</h3>
              <p className="text-indigo-100 text-sm mt-1 font-medium">Curated by Go AI based on your taste</p>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto scrollbar-hide">
              {recommendedProducts.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {recommendedProducts.map((product) => (
                    <div key={product.id} className="transform hover:-translate-y-1 transition-all duration-300">
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <Loader2 size={32} className="animate-spin mb-4 text-indigo-300" />
                  <p className="font-medium text-center">Go AI is preparing your<br/>personalized showcase...</p>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
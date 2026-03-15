"use client";

import { useEffect, useState } from "react";
import { getOrders } from "@/services/order.service";
import Link from "next/link"; 
import { Package, Calendar, CreditCard, ChevronRight, ShoppingBag, ArrowRight, Box, User, Hash, RefreshCw, Truck } from "lucide-react";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      getOrders()
        .then(setOrders)
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setIsLoggedIn(false);
      setLoading(false);
    }
  }, []);

  const BackgroundBlobs = () => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-[10%] right-[-10%] w-[400px] h-[400px] bg-purple-400/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "2s" }}></div>
    </div>
  );

  if (!loading && !isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
         <BackgroundBlobs />
         <div className="max-w-md w-full bg-white/80 backdrop-blur-xl border border-white/60 p-10 rounded-[2.5rem] shadow-xl text-center">
             <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-600">
                <User size={40} />
             </div>
             <h2 className="text-2xl font-bold text-slate-900 mb-2">Login to see your orders</h2>
             <p className="text-slate-500 mb-8 leading-relaxed">Track your packages, view order history, and manage returns easily.</p>
             
             <Link href="/login" className="block mb-4">
               <button className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-3 font-bold shadow-lg shadow-slate-900/20 transition-all">
                 Sign In
               </button>
             </Link>
             <div className="text-sm text-slate-500">
               New customer? <Link href="/register" className="text-indigo-600 font-bold hover:underline">Start here.</Link>
             </div>
         </div>
      </div>
    );
  }

  if (!loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8 flex justify-center items-center relative overflow-hidden">
         <BackgroundBlobs />
         <div className="max-w-3xl w-full bg-white/80 backdrop-blur-xl border border-white/60 p-12 rounded-[2.5rem] shadow-xl flex flex-col items-center text-center">
             <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6 text-indigo-600">
                <Box size={48} />
             </div>
             <h1 className="text-3xl font-bold text-slate-900 mb-3">No orders yet</h1>
             <p className="text-slate-500 mb-8 max-w-md">Looks like you haven't ordered anything from us in the past. Discover our products today!</p>
             {/* ✅ CHANGE: '/home' -> '/' */}
             <Link href="/">
               <button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-8 py-3 font-bold shadow-lg shadow-indigo-500/30 transition-all flex items-center gap-2">
                 Start Shopping <ArrowRight size={18} />
               </button>
             </Link>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-20 relative overflow-x-hidden font-sans">
      <BackgroundBlobs />
      
      {/* ✅ FIX: Max Width 1500px & Increased Padding Top (pt-36) */}
      <div className="max-w-[1500px] mx-auto pt-36 px-4">
        
        <h1 className="text-3xl font-extrabold text-slate-900 mb-8 px-2 flex items-center gap-3">
          <Package className="text-indigo-600" size={32} /> Your Orders
        </h1>

        <div className="space-y-6">
          {orders.map((o) => (
            <div key={o.id} className="bg-white/80 backdrop-blur-sm rounded-[2rem] shadow-sm border border-white overflow-hidden hover:shadow-md transition-all group">
              
              {/* Order Header */}
              <div className="bg-slate-50/80 p-6 border-b border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                
                <div className="flex flex-col">
                   <span className="text-slate-400 font-bold uppercase text-xs tracking-wider mb-1 flex items-center gap-1"><Calendar size={12}/> Order Placed</span>
                   <span className="font-semibold text-slate-700">{new Date(o.created_at).toLocaleDateString()}</span>
                </div>
                
                <div className="flex flex-col">
                   <span className="text-slate-400 font-bold uppercase text-xs tracking-wider mb-1 flex items-center gap-1"><CreditCard size={12}/> Total</span>
                   <span className="font-bold text-slate-900">₹{o.total_amount}</span>
                </div>
                
                <div className="flex flex-col">
                   <span className="text-slate-400 font-bold uppercase text-xs tracking-wider mb-1 flex items-center gap-1"><Hash size={12}/> Order ID</span>
                   <span className="font-mono text-slate-600">#{o.id}</span>
                </div>

                <div className="md:text-right flex items-center md:justify-end">
                   <button className="text-indigo-600 font-bold text-sm hover:text-indigo-800 transition-colors flex items-center gap-1">
                     View Details <ChevronRight size={16} />
                   </button>
                </div>
              </div>

              {/* Items List */}
              <div className="p-6 md:p-8">
                  <div className="flex items-center gap-2 mb-6 text-green-600 font-bold">
                      <Truck size={20} />
                      <h3>Arriving soon</h3>
                  </div>
                  
                  <div className="space-y-6">
                    {o.items && o.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                          {/* Image */}
                          <Link href={`/product/${item.product_id}`} className="w-24 h-24 flex-shrink-0 bg-white border border-slate-100 rounded-xl p-2 flex items-center justify-center">
                             <img 
                               src={item.img_url || "https://via.placeholder.com/100"} 
                               alt={item.title} 
                               className="w-full h-full object-contain mix-blend-multiply"
                             />
                          </Link>

                          {/* Details */}
                          <div className="flex-1 min-w-0">
                             <Link href={`/product/${item.product_id}`} className="text-lg font-bold text-slate-900 hover:text-indigo-600 transition-colors line-clamp-2 mb-1">
                               {item.title}
                             </Link>
                             <p className="text-xs text-slate-400 font-medium">Return window closed</p>
                             
                             <div className="mt-4 sm:hidden">
                                <button className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-slate-100 text-slate-700 rounded-lg text-sm font-bold hover:border-indigo-200 hover:text-indigo-600 transition-colors">
                                   <RefreshCw size={14} /> Buy it again
                                </button>
                             </div>
                          </div>

                          {/* Desktop Action */}
                          <div className="hidden sm:block">
                            <button className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:border-indigo-600 hover:text-indigo-600 hover:shadow-md transition-all transform hover:-translate-y-0.5">
                               <RefreshCw size={16} /> Buy it again
                            </button>
                          </div>
                      </div>
                    ))}
                  </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/services/api";
import { useRouter } from "next/navigation";
import { MapPin, Plus, ArrowLeft, CheckCircle, Truck } from "lucide-react";

export default function CheckoutPage() {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddr, setSelectedAddr] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    apiFetch("/user/address")
      .then((data) => {
        setAddresses(data);
        if (data.length > 0) setSelectedAddr(data[0].id);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleProceedToPayment = () => {
    if (!selectedAddr) return alert("Please select an address");
    // Payment page par Address ID bhej rahe hain
    router.push(`/payment?addressId=${selectedAddr}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">
        Loading addresses...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        
        {/* --- Header --- */}
        <button 
          onClick={() => router.back()} 
          className="flex items-center text-slate-500 hover:text-indigo-600 mb-6 transition-colors"
        >
          <ArrowLeft size={18} className="mr-2" /> Back to Cart
        </button>

        <h1 className="text-3xl font-bold text-slate-900 mb-2">Select Delivery Address</h1>
        <p className="text-slate-500 mb-8">Where should we send your order?</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          {/* --- Add New Address Card --- */}
          <button 
            onClick={() => router.push("/profile")}
            className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-2xl hover:border-indigo-500 hover:bg-indigo-50/50 transition-all group min-h-[180px]"
          >
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 mb-3 transition-colors">
              <Plus size={24} />
            </div>
            <span className="font-bold text-slate-600 group-hover:text-indigo-700">Add New Address</span>
          </button>

          {/* --- Existing Addresses --- */}
          {addresses.map((addr) => (
            <div 
              key={addr.id} 
              onClick={() => setSelectedAddr(addr.id)}
              className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all shadow-sm flex flex-col justify-between min-h-[180px] ${
                selectedAddr === addr.id 
                  ? 'border-indigo-600 bg-white ring-4 ring-indigo-50' 
                  : 'border-white bg-white hover:border-slate-300'
              }`}
            >
              {selectedAddr === addr.id && (
                <div className="absolute top-4 right-4 text-indigo-600">
                  <CheckCircle size={24} className="fill-indigo-100" />
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <MapPin size={18} className={selectedAddr === addr.id ? "text-indigo-600" : "text-slate-400"} />
                  <span className="font-bold text-slate-900 text-lg">{addr.full_name}</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-sm">
                  {addr.address_line}
                  <br />
                  {addr.city}, {addr.state} - {addr.zip_code}
                </p>
                <p className="text-slate-400 text-xs mt-1 uppercase font-semibold tracking-wider">{addr.country}</p>
              </div>

              {selectedAddr === addr.id && (
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-indigo-600 text-sm font-medium">
                  <Truck size={16} /> Delivery to this address
                </div>
              )}
            </div>
          ))}
        </div>

        {/* --- Footer Action --- */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 md:static md:bg-transparent md:border-0 md:p-0 flex justify-end">
           <div className="w-full md:w-auto flex flex-col md:flex-row items-center gap-4">
             {addresses.length === 0 && (
               <span className="text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                 Please add an address to continue
               </span>
             )}
             <button 
               onClick={handleProceedToPayment} 
               disabled={addresses.length === 0}
               className="w-full md:w-auto bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-8 py-4 font-bold shadow-lg shadow-slate-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
             >
               Proceed to Payment
             </button>
           </div>
        </div>

      </div>
    </div>
  );
}
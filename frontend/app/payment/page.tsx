"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { placeOrder } from "@/services/order.service"; 
import { CreditCard, Smartphone, Banknote, ArrowLeft, Lock, CheckCircle, ShieldCheck } from "lucide-react";

function PaymentContent() {
  const searchParams = useSearchParams();
  const addressId = searchParams.get("addressId");
  const router = useRouter();
  const [method, setMethod] = useState("card");
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!addressId) return alert("Address Error! Go back to checkout.");
    setLoading(true);

    try {
      // Fake processing delay (2 seconds)
      await new Promise(res => setTimeout(res, 2000));
      
      // Asli Order Backend Call
      await placeOrder(Number(addressId));
      
      alert("Payment Successful! Order Placed.");
      router.push("/orders"); 
    } catch (err: any) {
      alert(err.message || "Payment Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        
        {/* --- Header --- */}
        <button 
          onClick={() => router.back()} 
          className="flex items-center text-slate-500 hover:text-indigo-600 mb-6 transition-colors"
        >
          <ArrowLeft size={18} className="mr-2" /> Back to Checkout
        </button>

        <div className="flex items-center justify-between mb-8">
           <div>
              <h1 className="text-3xl font-bold text-slate-900">Payment Method</h1>
              <p className="text-slate-500 mt-1">Choose how you'd like to pay</p>
           </div>
           <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
              <ShieldCheck size={14} /> Secure
           </div>
        </div>

        {/* --- Payment Options Container --- */}
        <div className="space-y-4 mb-8">
           
           {/* 1. Credit / Debit Card */}
           <div 
             onClick={() => setMethod("card")}
             className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all overflow-hidden ${
                method === "card" 
                  ? 'border-indigo-600 bg-white ring-4 ring-indigo-50 shadow-md' 
                  : 'border-white bg-white hover:border-slate-200'
             }`}
           >
              <div className="flex items-center gap-4">
                 <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${method === "card" ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                    <CreditCard size={24} />
                 </div>
                 <div className="flex-1">
                    <h3 className={`font-bold text-lg ${method === "card" ? 'text-indigo-900' : 'text-slate-700'}`}>Credit or Debit Card</h3>
                    <p className="text-slate-400 text-sm">Visa, Mastercard, RuPay</p>
                 </div>
                 {method === "card" && <CheckCircle className="text-indigo-600 animate-in fade-in zoom-in" />}
              </div>

              {/* Dummy Card Form (Only Visible when Selected) */}
              {method === "card" && (
                <div className="mt-5 pt-5 border-t border-indigo-50 animate-in slide-in-from-top-2">
                   <input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl mb-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors" placeholder="0000 0000 0000 0000" disabled />
                   <div className="flex gap-3">
                      <input className="w-1/2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" placeholder="MM / YY" disabled />
                      <input className="w-1/2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" placeholder="CVV" disabled />
                   </div>
                </div>
              )}
           </div>

           {/* 2. UPI */}
           <div 
             onClick={() => setMethod("upi")}
             className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                method === "upi" 
                  ? 'border-indigo-600 bg-white ring-4 ring-indigo-50 shadow-md' 
                  : 'border-white bg-white hover:border-slate-200'
             }`}
           >
              <div className="flex items-center gap-4">
                 <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${method === "upi" ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                    <Smartphone size={24} />
                 </div>
                 <div className="flex-1">
                    <h3 className={`font-bold text-lg ${method === "upi" ? 'text-indigo-900' : 'text-slate-700'}`}>UPI</h3>
                    <p className="text-slate-400 text-sm">Google Pay, PhonePe, Paytm</p>
                 </div>
                 {method === "upi" && <CheckCircle className="text-indigo-600 animate-in fade-in zoom-in" />}
              </div>
           </div>

           {/* 3. Cash on Delivery */}
           <div 
             onClick={() => setMethod("cod")}
             className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                method === "cod" 
                  ? 'border-indigo-600 bg-white ring-4 ring-indigo-50 shadow-md' 
                  : 'border-white bg-white hover:border-slate-200'
             }`}
           >
              <div className="flex items-center gap-4">
                 <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${method === "cod" ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                    <Banknote size={24} />
                 </div>
                 <div className="flex-1">
                    <h3 className={`font-bold text-lg ${method === "cod" ? 'text-indigo-900' : 'text-slate-700'}`}>Cash on Delivery</h3>
                    <p className="text-slate-400 text-sm">Pay when your order arrives</p>
                 </div>
                 {method === "cod" && <CheckCircle className="text-indigo-600 animate-in fade-in zoom-in" />}
              </div>
           </div>

        </div>

        {/* --- Pay Button --- */}
        <button 
          onClick={handlePayment} 
          disabled={loading}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-4 font-bold shadow-lg shadow-slate-900/20 disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
             <>Processing...</>
          ) : (
             <><Lock size={18} /> Place Order & Pay</>
          )}
        </button>

      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">Loading Payment...</div>}>
      <PaymentContent />
    </Suspense>
  );
}
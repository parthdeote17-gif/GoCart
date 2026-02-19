"use client";

import { useState } from "react";
import { apiFetch } from "@/services/api"; 
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, User, Lock, KeyRound, ArrowRight, Loader2, ShoppingBag, ArrowLeft } from "lucide-react";

export default function RegisterPage() {
  const [step, setStep] = useState(1); // 1 = Email, 2 = OTP & Details
  const [form, setForm] = useState({
    email: "",
    otp: "",
    password: "",
    firstName: "",
    lastName: ""
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSendOtp() {
    if (!form.email.includes("@")) return alert("Please enter valid email");
    setLoading(true);
    try {
      await apiFetch("/auth/send-otp", { 
        method: "POST", 
        body: JSON.stringify({ email: form.email }) 
      });
      setStep(2);
      alert(`OTP sent to ${form.email}`);
    } catch (err: any) {
      alert(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister() {
    if (!form.otp || !form.password || !form.firstName) return alert("All fields are required");
    setLoading(true);
    try {
      const res = await apiFetch("/auth/register", { 
        method: "POST", 
        body: JSON.stringify({
            email: form.email,
            password: form.password,
            code: form.otp.trim(),
            firstName: form.firstName,
            lastName: form.lastName
        }) 
      });
      
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));
      
      alert("Account Created! Redirecting...");
      // ✅ CHANGE: Force reload to update Navbar state immediately
      window.location.href = "/"; 
    } catch (err: any) {
      alert(err.message || "Registration Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full bg-white font-sans">
      
      {/* --- LEFT SIDE: BRANDING (Hidden on Mobile) --- */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative items-center justify-center overflow-hidden">
        
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-700 via-indigo-800 to-slate-900 opacity-95"></div>
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-pink-500 rounded-full mix-blend-overlay filter blur-[100px] opacity-20 animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500 rounded-full mix-blend-overlay filter blur-[100px] opacity-20 animate-pulse animation-delay-2000"></div>

        {/* Content */}
        <div className="relative z-10 text-center px-12">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-2xl border border-white/20">
             <ShoppingBag size={40} className="text-white" />
          </div>
          <h1 className="text-5xl font-black text-white mb-6 tracking-tight">Join GoCart</h1>
          <p className="text-purple-100 text-lg leading-relaxed max-w-md mx-auto font-medium">
            Create an account today to start shopping, track orders, and get exclusive member-only discounts.
          </p>
        </div>
      </div>

      {/* --- RIGHT SIDE: REGISTER FORM --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 md:p-24 bg-white relative">
        <div className="w-full max-w-md space-y-8">
          
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create Account</h2>
            <p className="mt-2 text-slate-500 font-medium">
              {step === 1 ? "Enter your email to get started." : "Verify your email and set a password."}
            </p>
          </div>

          {/* Step 1: Email Input */}
          {step === 1 ? (
            <div className="space-y-6">
              <div className="group relative">
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1 ml-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="text-slate-400 group-focus-within:text-purple-600 transition-colors" size={20} />
                  </div>
                  <input
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                    placeholder="name@example.com"
                    value={form.email}
                    onChange={(e) => setForm({...form, email: e.target.value})}
                  />
                </div>
              </div>

              <button 
                onClick={handleSendOtp} 
                disabled={loading}
                className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-purple-500/30 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="animate-spin" size={24} /> : <>Send Code <ArrowRight size={20} /></>}
              </button>
            </div>
          ) : (
            /* Step 2: OTP & Details */
            <div className="space-y-5 animate-fadeIn">
              
              <div className="bg-purple-50 border border-purple-100 p-3 rounded-lg text-sm text-purple-700 flex justify-between items-center">
                 <span>Code sent to <strong>{form.email}</strong></span>
                 <button onClick={() => setStep(1)} className="text-xs font-bold underline hover:text-purple-900">Change</button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User className="text-slate-400" size={18} /></div>
                   <input 
                     className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all text-sm font-medium"
                     placeholder="First Name"
                     value={form.firstName} 
                     onChange={(e) => setForm({...form, firstName: e.target.value})} 
                   />
                </div>
                <div className="relative">
                   <input 
                     className="w-full pl-4 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all text-sm font-medium"
                     placeholder="Last Name"
                     value={form.lastName} 
                     onChange={(e) => setForm({...form, lastName: e.target.value})} 
                   />
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><KeyRound className="text-slate-400" size={18} /></div>
                <input
                  className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all text-sm font-medium tracking-widest"
                  placeholder="Enter 6-digit OTP"
                  value={form.otp}
                  onChange={(e) => setForm({...form, otp: e.target.value})}
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="text-slate-400" size={18} /></div>
                <input
                  type="password"
                  className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all text-sm font-medium"
                  placeholder="Create Password"
                  value={form.password}
                  onChange={(e) => setForm({...form, password: e.target.value})}
                />
              </div>

              <button 
                onClick={handleRegister} 
                disabled={loading}
                className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-green-500/30 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="animate-spin" size={24} /> : "Verify & Register"}
              </button>
              
              <button 
                onClick={() => setStep(1)} 
                className="flex items-center justify-center gap-2 w-full text-slate-500 text-sm font-bold hover:text-slate-700 mt-4 transition-colors"
              >
                <ArrowLeft size={16} /> Back to Email
              </button>
            </div>
          )}

          {/* Footer */}
          <p className="text-center text-slate-500 font-medium pt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-purple-600 font-bold hover:underline">
              Sign in
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
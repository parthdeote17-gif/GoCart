"use client";

import { useState } from "react";
import { login } from "@/services/auth.service";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, ArrowRight, Loader2, ShoppingBag, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // ✅ Toggle State
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(email, password);
      // Login success, home page par bhejo
      // ✅ FIX: '/home' ko hatakar '/' kar diya
      window.location.href = "/"; 
    } catch (err: any) {
      setError(err.message || "Invalid email or password");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full bg-white font-sans">
      
      {/* --- LEFT SIDE: BRANDING (Hidden on Mobile) --- */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative items-center justify-center overflow-hidden">
        
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-700 to-slate-900 opacity-90"></div>
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

        {/* Content */}
        <div className="relative z-10 text-center px-12">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-2xl border border-white/20">
             <ShoppingBag size={40} className="text-white" />
          </div>
          <h1 className="text-5xl font-black text-white mb-6 tracking-tight">GoCart</h1>
          <p className="text-indigo-100 text-lg leading-relaxed max-w-md mx-auto font-medium">
            Welcome back! Log in to access your orders, wishlist, and exclusive deals.
          </p>
        </div>
      </div>

      {/* --- RIGHT SIDE: LOGIN FORM --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 md:p-24 bg-white">
        <div className="w-full max-w-md space-y-8">
          
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Sign In</h2>
            <p className="mt-2 text-slate-500 font-medium">Please enter your credentials to continue.</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg text-sm font-medium animate-pulse">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-6">
            
            {/* Email Input */}
            <div className="group relative">
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1 ml-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                </div>
                <input
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                  placeholder="name@example.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Input (Updated with Show/Hide) */}
            <div className="group relative">
              <div className="flex justify-between items-center mb-1 ml-1">
                 <label className="block text-xs font-bold uppercase text-slate-500">Password</label>
                 <Link href="#" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors">Forgot?</Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                </div>
                <input
                  type={showPassword ? "text" : "password"} // ✅ Dynamic Type
                  className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                
                {/* ✅ Show/Hide Toggle Button */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-indigo-600 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-500/30 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  Login <ArrowRight size={20} />
                </>
              )}
            </button>

          </form>

          {/* Footer */}
          <p className="text-center text-slate-500 font-medium">
            Don't have an account?{" "}
            <Link href="/register" className="text-indigo-600 font-bold hover:underline">
              Register here
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
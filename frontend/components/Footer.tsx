import Link from "next/link";
import { ShoppingBag, Facebook, Instagram, Twitter, Send } from "lucide-react";

export default function Footer() {
  return (
    <footer className="pt-20 pb-12 px-6 max-w-7xl mx-auto border-t border-slate-200 mt-20">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

        {/* Brand Info */}
        <div className="col-span-1 md:col-span-1">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <ShoppingBag size={18} />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-500">
              Go Cart
            </span>
          </div>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            Redefining the digital shopping experience with style, efficiency, and premium quality products delivered instantly.
          </p>
          <div className="flex gap-4">
            {[Facebook, Instagram, Twitter].map((Icon, i) => (
              <button key={i} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-indigo-600 hover:text-white transition-all">
                <Icon size={18} />
              </button>
            ))}
          </div>
        </div>

        {/* Links Column 1 - Updated with Home & Wishlist */}
        <div>
          <h5 className="font-bold text-slate-900 mb-6">Shop</h5>
          <ul className="space-y-4 text-slate-500 text-sm">
            {/* ✅ CHANGE: '/home' -> '/' */}
            <li><Link href="/" className="hover:text-indigo-600 transition-colors">Home</Link></li>
            <li><Link href="/wishlist" className="hover:text-indigo-600 transition-colors">My Wishlist</Link></li>
          </ul>
        </div>

        {/* Links Column 2 - Points to /about */}
        <div>
          <h5 className="font-bold text-slate-900 mb-6">Company</h5>
          <ul className="space-y-4 text-slate-500 text-sm">
            <li><Link href="/about" className="hover:text-indigo-600 transition-colors">About Us</Link></li>
            <li><Link href="/about" className="hover:text-indigo-600 transition-colors">Contact</Link></li>
            <li><Link href="/about" className="hover:text-indigo-600 transition-colors">Careers</Link></li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h5 className="font-bold text-slate-900 mb-6">Newsletter</h5>
          <p className="text-slate-500 text-sm mb-4">Join our mailing list for exclusive updates.</p>
          <div className="flex gap-2">
            <input
              className="w-full px-4 py-2 rounded-xl bg-slate-100 border-none focus:ring-2 focus:ring-indigo-600 outline-none text-sm"
              placeholder="Email address"
              type="email"
            />
            <button className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 transition-colors">
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="text-center text-slate-400 text-sm border-t border-slate-100 pt-8">
        © 2026 GoCart. All rights reserved. Designed for the modern web.
      </div>
    </footer>
  );
}
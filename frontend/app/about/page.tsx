"use client";

import { Users, Mail, Briefcase, MapPin, Phone, Globe } from "lucide-react";

export default function AboutPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      color: '#0f172a',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      position: 'relative',
      overflowX: 'hidden',
      paddingBottom: '4rem'
    }}>
      
      {/* Background Blobs */}
      <div style={{ position: 'fixed', inset: '0', overflow: 'hidden', pointerEvents: 'none', zIndex: '0' }}>
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pt-32 pb-20 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">
            We are <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">GoCart</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Revolutionizing the way you shop online. We believe in quality, speed, and an exceptional customer experience.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* About Us Section */}
          <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-xl border border-white/50 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600">
                <Users size={24} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Who We Are</h2>
            </div>
            <div className="space-y-4 text-slate-600 leading-relaxed">
              <p>
                Founded in 2026, GoCart was born from a simple idea great shopping should feel effortless. We handpick premium products from around the world, focusing on quality, design, and value so you can shop with confidence, knowing every item meets our high standards. From discovery to delivery, we’re here to make every purchase feel just right.
              </p>
              <p>
                We’re a diverse team of dreamers, doers, and builders brought together by a love for technology and great design. We’re always experimenting, improving, and pushing boundaries using smart, cutting-edge tech to create a smoother, more intuitive shopping experience made just for you.
              </p>
            </div>
          </div>

          {/* Careers Section */}
          <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-xl border border-white/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-purple-100 rounded-xl text-purple-600">
                <Briefcase size={24} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Careers</h2>
            </div>
            <p className="text-slate-600 mb-6 leading-relaxed">
              Join us in building the future of commerce. We are always looking for talented individuals to join our growing team.
            </p>
            <div className="space-y-3">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-indigo-200 transition-colors cursor-pointer">
                <h4 className="font-bold text-slate-900">Senior Frontend Developer</h4>
                <p className="text-xs text-slate-500 mt-1">Remote • Full Time</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-indigo-200 transition-colors cursor-pointer">
                <h4 className="font-bold text-slate-900">Product Designer</h4>
                <p className="text-xs text-slate-500 mt-1">Nagpur, India • Hybrid</p>
              </div>
            </div>
            <button className="w-full mt-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-indigo-600 transition-all">
              View All Openings
            </button>
          </div>

          {/* Contact Section */}
          <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-xl border border-white/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-pink-100 rounded-xl text-pink-600">
                <Mail size={24} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Contact Us</h2>
            </div>
            <p className="text-slate-600 mb-8">
              Have questions? We'd love to hear from you.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <MapPin className="text-indigo-600 mt-1" size={20} />
                <div>
                  <h5 className="font-bold text-slate-900">Headquarters</h5>
                  <p className="text-slate-500 text-sm">Orangebits Technologies, Trimurti Nagar<br/>Nagpur, Maharashtra 440009</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <Phone className="text-indigo-600" size={20} />
                <div>
                  <h5 className="font-bold text-slate-900">Phone</h5>
                  <p className="text-slate-500 text-sm">+91 123 456 7890</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Globe className="text-indigo-600" size={20} />
                <div>
                  <h5 className="font-bold text-slate-900">Email</h5>
                  <p className="text-slate-500 text-sm">officialgocart70@gmail.com</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <style jsx global>{`
        .blob { position: absolute; border-radius: 50%; filter: blur(120px); opacity: 0.4; animation: float 6s ease-in-out infinite; }
        .blob-1 { top: -10%; left: -10%; width: 600px; height: 600px; background: #a855f7; }
        .blob-2 { bottom: 10%; right: -10%; width: 500px; height: 500px; background: #22d3ee; animation-delay: 2s; }
        .blob-3 { top: 40%; left: 20%; width: 300px; height: 300px; background: #f472b6; filter: blur(100px); }
        @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }
      `}</style>
    </div>
  );
}
"use client";
import { useEffect, useState, use } from "react"; 
import { getProductById, getRelatedProducts } from "@/services/product.service"; 
import { 
  getReviews, 
  addReview, 
  deleteReviewService, 
  editReviewService 
} from "@/services/review.service"; 
import { addToCart } from "@/services/cart.service"; 
import { toggleWishlist } from "@/services/wishlist.service"; 
import { useRouter } from "next/navigation"; 
import Link from "next/link"; 
import { ArrowLeft, Star, ShoppingBag, Zap, Trash2, CheckCircle, Heart, Share2, Pencil } from "lucide-react";
import ProductCard from "@/components/ProductCard"; 

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params); 
  const router = useRouter(); 
  
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]); 
  const [reviews, setReviews] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const [newReview, setNewReview] = useState("");
  const [rating, setRating] = useState(5);
  const [liked, setLiked] = useState(false); 

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editComment, setEditComment] = useState("");
  const [editRating, setEditRating] = useState(5);

  useEffect(() => {
    if(!id) return;
    getProductById(id).then(setProduct);
    refreshReviews();
    getRelatedProducts(id).then(setRelatedProducts);

    const userStr = localStorage.getItem("user");
    if (userStr) {
      try { setCurrentUser(JSON.parse(userStr)); } catch (e) {}
    }
  }, [id]);

  const refreshReviews = () => {
    getReviews(id).then(setReviews);
  };

  const handleWishlist = async () => {
    setLiked(!liked);
    try {
      await toggleWishlist(Number(id));
    } catch (error) {
      setLiked((prev) => !prev);
      alert("Please login to use Wishlist");
    }
  };

  const submitReview = async () => {
    if (!newReview.trim()) return alert("Please write a comment");
    try {
      await addReview(Number(id), rating, newReview);
      setNewReview(""); 
      refreshReviews(); 
    } catch (error) {
      alert("Failed to add review. Login kiya hai?");
    }
  };

  const deleteReview = async (reviewId: number) => {
    if(!confirm("Are you sure you want to delete this review?")) return;
    try {
        await deleteReviewService(reviewId);
        setReviews(reviews.filter(r => r.id !== reviewId));
    } catch(err) { alert("Failed to delete review"); }
  };

  const handleEditClick = (review: any) => {
    setEditingId(review.id);
    setEditComment(review.comment);
    setEditRating(review.rating);
  };

  const handleUpdateReview = async () => {
    if (!editingId) return;
    try {
      await editReviewService(editingId, editRating, editComment);
      setEditingId(null);
      refreshReviews();
    } catch (error) {
      alert("Failed to update review");
    }
  };

  const handleAddToCart = async () => {
    try {
      await addToCart(Number(id));
      router.push("/cart"); 
    } catch (error) {
      alert("Please login first");
      router.push("/login");
    }
  };

  const handleBuyNow = async () => {
    try {
      await addToCart(Number(id)); 
      router.push("/checkout");    
    } catch (error) {
      alert("Please login first");
      router.push("/login");
    }
  };

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
       <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900 selection:bg-indigo-500 selection:text-white relative overflow-x-hidden">
      
      {/* Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[10%] left-[-10%] w-[500px] h-[500px] bg-purple-400/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "2s" }}></div>
      </div>

      {/* ✅ FIX: Max Width 1500px & Padding Top 32 (Navbar se dur) */}
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 pt-32 pb-20">
        
        {/* Navigation */}
        <div className="flex justify-between items-center mb-8">
            <button 
              onClick={() => router.back()} 
              className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors group"
            >
              <div className="p-2.5 bg-white rounded-xl border border-slate-100 shadow-sm group-hover:shadow-md transition-all">
                  <ArrowLeft size={18} />
              </div>
              <span className="font-bold text-sm">Back</span>
            </button>
            <button className="p-2.5 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md text-slate-400 hover:text-indigo-600 transition-all">
                <Share2 size={18} />
            </button>
        </div>

        {/* --- PRODUCT MAIN CARD --- */}
        <div className="bg-white/70 backdrop-blur-2xl border border-white/50 rounded-[2.5rem] p-6 md:p-10 shadow-2xl shadow-slate-200/50 mb-16 relative overflow-hidden">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-center relative z-10">
            
            {/* Left: Image Section */}
            <div className="relative aspect-square bg-white rounded-[2rem] flex items-center justify-center p-8 border border-slate-100 shadow-inner group">
               <button 
                 onClick={handleWishlist}
                 className="absolute top-6 right-6 p-3 rounded-full bg-white/90 backdrop-blur shadow-lg border border-slate-100 z-20 hover:scale-110 active:scale-95 transition-all group/heart"
               >
                 <Heart 
                   size={24} 
                   className={`transition-colors duration-300 ${liked ? "fill-red-500 text-red-500" : "text-slate-400 group-hover/heart:text-red-400"}`} 
                 />
               </button>

               <div className="absolute inset-0 bg-gradient-to-tr from-indigo-50/50 to-transparent rounded-[2rem]"></div>
               <img 
                 src={product.img_url || product.imgUrl} 
                 className="relative z-10 w-full h-full object-contain mix-blend-multiply transition-transform duration-700 ease-out group-hover:scale-105" 
                 alt={product.title}
               />
            </div>

            {/* Right: Product Info */}
            <div className="space-y-8">
               <div>
                 <div className="flex items-center gap-3 mb-4">
                     <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100">
                       {product.category_name || "Official Store"}
                     </span>
                     {product.stock_status !== 'OUT_OF_STOCK' && (
                        <span className="text-[10px] font-bold uppercase tracking-widest text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-100 flex items-center gap-1">
                           <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> In Stock
                        </span>
                     )}
                 </div>
                 <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight tracking-tight">
                   {product.title}
                 </h1>
               </div>

               <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                 <div className="flex items-center gap-1 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100">
                   <Star size={18} className="fill-amber-400 text-amber-400" />
                   <span className="font-bold text-amber-700">{rating || 4.5}</span>
                 </div>
                 <span className="text-slate-400 text-sm font-medium">• {reviews.length} Verified Reviews</span>
               </div>

               <p className="text-slate-600 text-lg leading-relaxed">{product.description}</p>

               <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-center justify-between">
                 <div>
                    <p className="text-slate-400 text-sm font-bold line-through mb-1">M.R.P: ₹{Math.round(Number(product.price) * 1.3)}</p>
                    <p className="text-4xl font-black text-slate-900">₹{product.price}</p>
                 </div>
                 <div className="text-right">
                    <p className="text-xs text-indigo-600 font-bold bg-indigo-50 px-2 py-1 rounded mb-1">Save 30%</p>
                    <p className="text-xs text-slate-400 font-medium">Inclusive of all taxes</p>
                 </div>
               </div>

               <div className="flex flex-col sm:flex-row gap-4">
                 <button onClick={handleAddToCart} className="flex-1 py-4 px-8 rounded-2xl bg-white border-2 border-slate-200 text-slate-900 font-bold hover:border-indigo-600 hover:text-indigo-600 transition-all flex items-center justify-center gap-3 shadow-sm hover:shadow-xl active:scale-95">
                   <ShoppingBag size={20} /> Add to Cart
                 </button>
                 <button onClick={handleBuyNow} className="flex-1 py-4 px-8 rounded-2xl bg-slate-900 text-white font-bold hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 shadow-lg shadow-slate-900/20 hover:shadow-indigo-500/30 active:scale-95">
                   <Zap size={20} /> Buy Now
                 </button>
               </div>
               
               <div className="flex items-center gap-6 justify-center sm:justify-start pt-2">
                 <div className="flex items-center gap-2 text-xs font-bold text-slate-500"><CheckCircle size={16} className="text-green-500" /> Genuine Product</div>
                 <div className="flex items-center gap-2 text-xs font-bold text-slate-500"><CheckCircle size={16} className="text-green-500" /> Fast Delivery</div>
               </div>
            </div>
          </div>
        </div>

        {/* ✅ SIMILAR PRODUCTS SECTION */}
        {relatedProducts.length > 0 && (
           <div className="mb-20">
              <div className="flex items-center gap-3 mb-8">
                 <div className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl">
                    <Zap size={24} className="fill-indigo-600"/>
                 </div>
                 <h2 className="text-3xl font-black text-slate-900">Similar Products</h2>
              </div>
              
              {/* ✅ Adjusted Grid for 1500px Layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                 {relatedProducts.map((relProd) => (
                    <ProductCard key={relProd.id} product={relProd} />
                 ))}
              </div>
           </div>
        )}

        {/* --- REVIEWS SECTION --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Write Review Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 sticky top-28">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Star className="fill-slate-900 text-slate-900" size={20} /> Write a Review
              </h3>
              
              {currentUser ? (
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Rate Product</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} onClick={() => setRating(star)} className={`flex-1 aspect-square rounded-xl flex items-center justify-center transition-all ${rating >= star ? 'bg-amber-400 text-white shadow-lg shadow-amber-400/30 scale-105' : 'bg-slate-50 text-slate-300 hover:bg-slate-100'}`}>
                          <Star size={20} className="fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Your Experience</label>
                    <textarea 
                      className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none text-slate-700 resize-none h-32 transition-all font-medium" 
                      placeholder="What did you like or dislike?"
                      value={newReview}
                      onChange={(e) => setNewReview(e.target.value)}
                    />
                  </div>

                  <button onClick={submitReview} className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-indigo-600 transition-all shadow-lg shadow-slate-900/20 hover:shadow-indigo-500/30 active:scale-95">
                    Submit Review
                  </button>
                </div>
              ) : (
                <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-slate-500 font-medium mb-4">Share your thoughts with other customers</p>
                  <Link href="/login">
                    <button className="px-6 py-2.5 bg-white border border-slate-200 text-slate-900 rounded-xl font-bold hover:border-indigo-600 hover:text-indigo-600 transition-all shadow-sm">
                      Login to Review
                    </button>
                  </Link>
                </div>
              )}

            </div>
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-2xl font-black text-slate-900 mb-6">Customer Reviews <span className="text-slate-400 font-medium text-lg ml-2">({reviews.length})</span></h3>
            
            {reviews.length === 0 ? (
               <div className="text-center py-16 bg-white/50 rounded-[2.5rem] border border-dashed border-slate-300">
                 <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400"><Star size={32} /></div>
                 <p className="text-slate-500 font-medium text-lg">No reviews yet. Be the first!</p>
               </div>
            ) : (
              reviews.map((rev) => (
                <div key={rev.id} className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/20">
                        {(rev.user_name || rev.user_email || "U")[0].toUpperCase()}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                        {/* --- EDIT MODE --- */}
                        {editingId === rev.id ? (
                           <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
                               <div className="flex gap-2 mb-3">
                                  {[1,2,3,4,5].map(r => (
                                      <button key={r} onClick={()=>setEditRating(r)} className={editRating >= r ? "text-amber-400" : "text-slate-300"}>
                                          <Star size={18} className="fill-current"/>
                                      </button>
                                  ))}
                               </div>
                               <textarea 
                                  value={editComment} 
                                  onChange={(e)=>setEditComment(e.target.value)}
                                  className="w-full p-3 rounded-xl border border-indigo-200 text-sm mb-3 focus:outline-none focus:border-indigo-500"
                               />
                               <div className="flex gap-3">
                                   <button onClick={handleUpdateReview} className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700">Save Changes</button>
                                   <button onClick={()=>setEditingId(null)} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50">Cancel</button>
                               </div>
                           </div>
                        ) : (
                           /* --- VIEW MODE --- */
                           <>
                             <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-bold text-slate-900 text-lg">{rev.user_name || rev.user_email || 'Verified Buyer'}</h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    <div className="flex text-amber-400">
                                      {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={14} className={i < rev.rating ? "fill-current" : "text-slate-200"} />
                                      ))}
                                    </div>
                                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                    <span className="text-xs text-slate-400 font-medium">{rev.created_at ? new Date(rev.created_at).toLocaleDateString() : "Just now"}</span>
                                  </div>
                                </div>
                                
                                {currentUser && (currentUser.id === rev.user_id || currentUser.email === rev.user_email) && (
                                  <div className="flex gap-2">
                                     <button onClick={() => handleEditClick(rev)} className="p-2 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all" title="Edit">
                                       <Pencil size={18} />
                                     </button>
                                     <button onClick={() => deleteReview(rev.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Delete">
                                       <Trash2 size={18} />
                                     </button>
                                  </div>
                                )}
                             </div>
                             
                             <div className="mt-4 text-slate-600 leading-relaxed font-medium">
                               "{rev.comment}"
                             </div>
                           </>
                        )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
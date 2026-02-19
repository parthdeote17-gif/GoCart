import express from "express";
import cors from "cors";

// Routes Imports
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import cartRoutes from "./routes/cart.routes.js"; 
import orderRoutes from "./routes/order.routes.js"; 
import reviewRoutes from "./routes/review.routes.js"; 
import userRoutes from "./routes/user.routes.js"; 
import wishlistRoutes from "./routes/wishlist.routes.js"; // ✅ Wishlist Route Import

const app = express();

// ✅ CORS SETTINGS (Updated for Ngrok & Flutter)
app.use(cors({
  origin: true, // "true" ka matlab hai dynamic origin (Ngrok, Localhost, Mobile sab chalega)
  credentials: true, // Cookies aur Authorization Headers allow karega
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  // 👇 Ye headers bahut zaroori hain Ngrok error hatane ke liye
  allowedHeaders: ["Content-Type", "Authorization", "ngrok-skip-browser-warning"]
}));

app.use(express.json());

// Routes Mount
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/user", userRoutes);
app.use("/api/wishlist", wishlistRoutes); // ✅ Wishlist API Active

export default app;
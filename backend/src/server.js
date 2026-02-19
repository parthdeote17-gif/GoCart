import "dotenv/config"; // <--- YE LINE SABSE PEHLE HONI CHAHIYE
import app from "./app.js";

// --- NAYA IMPORT ---
import userRoutes from "./routes/user.routes.js"; 

const PORT = process.env.PORT || 5000;

// --- NAYA ROUTE MOUNT KARNA (Zaroori hai) ---
// Profile, Address, aur Delete Account is route par chalenge
app.use("/api/user", userRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
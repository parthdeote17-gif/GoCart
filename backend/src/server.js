import "dotenv/config"; 
import app from "./app.js";
import userRoutes from "./routes/user.routes.js"; 

// 🚀 SMART PORT LOGIC:
// Render par process.env.PORT automatic mil jayega.
// Local machine par ye default 5000 use karega.
const PORT = process.env.PORT || 5000;

// 🚀 SMART HOST LOGIC:
// Render ke liye "0.0.0.0" hona compulsory hai.
// Localhost par bhi "0.0.0.0" mast chalta hai (saare network interfaces bind karta hai).
const HOST = '0.0.0.0';

app.use("/api/user", userRoutes);

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server is running!`);
  console.log(`🏠 Local: http://localhost:${PORT}`);
  console.log(`🌐 Network: http://${HOST}:${PORT}`);

  // ==========================================
  // 🔥 AUTO WAKE-UP TRICK FOR ML SERVICE
  // ==========================================
  const pythonUrl = process.env.PYTHON_ML_SERVICE_URL || "http://127.0.0.1:8000";
  console.log(`⏰ Sending Wake-Up ping to ML Service at: ${pythonUrl}...`);

  // Fire-and-forget request bhej rahe hain (Wait nahi karenge)
  fetch(`${pythonUrl}/`) 
    .then((response) => {
        if(response.ok) {
            console.log("✅ ML Service is awake and ready!");
        } else {
            console.log("⚠️ ML Service pinged, but returned an error (Cold start in progress).");
        }
    })
    .catch((err) => {
        // Cold start mein fetch fail ho sakta hai timeout ki wajah se, 
        // par Render hamara signal catch karke server start kar dega.
        console.log("⚠️ ML Wake-up signal sent! (It's booting up now).");
    });
});
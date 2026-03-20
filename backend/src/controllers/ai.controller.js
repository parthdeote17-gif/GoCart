import axios from "axios";

export const chatWithAI = async (req, res) => {
  try {
    const { userId, message } = req.body;
    
    // Call Python FastAPI Server (Port 8000)
    const pythonUrl = process.env.PYTHON_ML_SERVICE_URL || "http://127.0.0.1:8000";
    
    const response = await axios.post(`${pythonUrl}/chat`, {
      user_id: userId || "guest",
      message: message
    });

    // 👇 UPDATED: Now passing products and actions from Python to Frontend
    res.json({ 
      success: true, 
      reply: response.data.reply,
      products: response.data.products || [],             // Array of product objects
      action: response.data.action || null,               // "add_to_cart" or "add_to_wishlist"
      action_product_id: response.data.action_product_id  // Product ID to perform action on
    });
    
  } catch (error) {
    console.error("AI Service Error:", error.message);
    res.status(500).json({ 
      success: false, 
      reply: "Go AI is currently upgrading its brain. Please try again in a minute!" 
    });
  }
};
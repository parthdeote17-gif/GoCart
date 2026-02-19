import express from "express";
import { authenticateToken } from "../middleware/auth.middleware.js"; // <--- FIXED IMPORT
import { placeOrder, getOrders } from "../controllers/order.controller.js"; // <--- FIXED CONTROLLER IMPORT

const router = express.Router();

router.post("/", authenticateToken, placeOrder); // Order Place karna
router.get("/", authenticateToken, getOrders);   // Order History dekhna

export default router;
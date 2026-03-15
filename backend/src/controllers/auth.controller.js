import { sendOTPEmail } from "../config/mailer.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import { generateToken } from "../utils/token.js";
import { 
  saveOTP, 
  findOTP, 
  deleteOTP, 
  findUserByEmail, 
  createUser,
  updateUserProfile, 
  deleteUserAccount,
  addAddress, 
  getUserAddresses,
  // ✅ NEW IMPORTS: Address Edit/Delete ke liye models import kiye
  updateAddressModel,
  deleteAddressModel
} from "../models/user.model.js";

/* SEND OTP (Same Logic) */
export async function sendOTP(req, res) {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email required" });

  try {
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "Account already exists with this email. Please Login." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    await saveOTP(email, otp, expires);
    const emailSent = await sendOTPEmail(email, otp);
    
    if (!emailSent) return res.status(500).json({ message: "Failed to send email" });
    
    console.log(`OTP Sent to ${email}: ${otp}`);
    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

/* REGISTER (Same Logic) */
export async function register(req, res) {
  const { email, password, code, firstName, lastName } = req.body;

  try {
    console.log(`Registering: ${email}, Code Received: '${code}'`);
    const cleanCode = code ? code.toString().trim() : "";

    const record = await findOTP(email, cleanCode);

    if (!record) {
      return res.status(400).json({ message: "Invalid OTP! Registration Failed." });
    }
    if (new Date() > new Date(record.expires_at)) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    const hashed = await hashPassword(password);
    const user = await createUser(email, hashed, firstName, lastName); 

    await deleteOTP(email);

    const token = generateToken(user);
    res.json({ message: "User registered successfully", token, user });

  } catch (err) {
    console.error("Register Error:", err);
    if (err.code === '23505') return res.status(400).json({ message: "Email already exists" });
    res.status(500).json({ message: "Registration failed" });
  }
}

/* LOGIN (Same Logic) */
export async function login(req, res) {
  const { email, password } = req.body;

  try {
    const user = await findUserByEmail(email);
    
    if (!user) return res.status(400).json({ message: "User not found" });

    const valid = await comparePassword(password, user.password_hash);
    if (!valid) return res.status(401).json({ message: "Wrong password" });

    const token = generateToken(user);
    res.json({ token, user }); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login error" });
  }
}

/* --- FEATURES --- */

// Get Profile (Same Logic)
export async function getProfile(req, res) {
  try {
    const user = await findUserByEmail(req.user.email);
    res.json(user);
  } catch(err) { res.status(500).json({ error: err.message }); }
}

// ✅ Update Profile (Updated: Phone logic added)
export async function updateProfile(req, res) {
  const { firstName, lastName, phone } = req.body; // Phone receive kiya
  try {
    // Phone pass kiya model function ko
    const user = await updateUserProfile(req.user.id, firstName, lastName, phone);
    res.json({ message: "Profile updated", user });
  } catch(err) { res.status(500).json({ error: err.message }); }
}

// Delete Account (Same Logic)
export async function deleteAccount(req, res) {
  try {
    await deleteUserAccount(req.user.id);
    res.json({ message: "Account deleted successfully" });
  } catch(err) { res.status(500).json({ error: err.message }); }
}

// --- ADDRESS CONTROLLERS ---

// Save Address (Same Logic)
export async function saveAddress(req, res) {
  try {
    const address = await addAddress(req.user.id, req.body);
    res.json({ message: "Address saved", address });
  } catch(err) { res.status(500).json({ error: err.message }); }
}

// Get Addresses (Same Logic)
export async function getAddresses(req, res) {
  try {
    const addresses = await getUserAddresses(req.user.id);
    res.json(addresses);
  } catch(err) { res.status(500).json({ error: err.message }); }
}

// ✅ NEW: Edit Address
export async function updateAddress(req, res) {
  try {
    const { id } = req.params; // Address ID from URL
    const updatedAddr = await updateAddressModel(id, req.user.id, req.body);
    
    if (!updatedAddr) {
      return res.status(404).json({ message: "Address not found or unauthorized" });
    }
    res.json({ message: "Address updated", address: updatedAddr });
  } catch (err) { res.status(500).json({ error: err.message }); }
}

// ✅ NEW: Delete Address
export async function deleteAddress(req, res) {
  try {
    const { id } = req.params; // Address ID from URL
    await deleteAddressModel(id, req.user.id);
    res.json({ message: "Address deleted" });
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export async function verifyOTP(req, res) {
  res.status(200).json({ message: "Please use register endpoint" });
}
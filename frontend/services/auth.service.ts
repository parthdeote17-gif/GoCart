import { apiFetch } from "./api";

// Login
export async function login(email: string, password: string) {
  const data = await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  
  if (data.token) {
    localStorage.setItem("token", data.token);
    // UPDATE: User ka data save karna zaroori hai taaki Profile page aur Navbar par Naam dikhe
    localStorage.setItem("user", JSON.stringify(data.user)); 
  }
  return data;
}

// Send OTP
export async function sendOtp(email: string) {
  return apiFetch("/auth/send-otp", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

// Register (Updated: Parameter 'otp' liya aur backend ko 'code' bheja)
export async function register(email: string, password: string, otp: string, firstName: string, lastName: string) {
  return apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify({ 
      email, 
      password, 
      code: otp, // <--- Backend 'code' maangta hai, isliye map kiya
      firstName, 
      lastName 
    }),
  });
}
import { apiFetch } from "./api";

// Login
export async function login(email: string, password: string) {
  const data = await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  
  if (data.token) {
    localStorage.setItem("token", data.token);
    //Update: Store user data to display the user's name on the Profile page and Navbar
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

// Update: Added the otp parameter and sent it to the backend as code during registration
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

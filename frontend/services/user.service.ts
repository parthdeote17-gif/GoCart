import { apiFetch } from "./api";

// --- User Profile ---
export const getUserProfile = async () => {
  return await apiFetch("/user/profile");
};

export const updateUserProfile = async (data: any) => {
  return await apiFetch("/user/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

// --- ✅ Address CRUD Functions ---

export const getAddresses = async () => {
  return await apiFetch("/user/address");
};

export const addAddress = async (data: any) => {
  return await apiFetch("/user/address", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const updateAddress = async (id: number, data: any) => {
  return await apiFetch(`/user/address/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

export const deleteAddress = async (id: number) => {
  return await apiFetch(`/user/address/${id}`, {
    method: "DELETE",
  });
};
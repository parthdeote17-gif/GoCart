import pool from "../config/db.js";

// --- OTP FUNCTIONS (Same Logic) ---
export const saveOTP = async (email, otp, expires) => {
  await pool.query("DELETE FROM email_verifications WHERE email=$1", [email]);
  await pool.query(
    "INSERT INTO email_verifications (email, code, expires_at) VALUES ($1, $2, $3)",
    [email, otp, expires]
  );
};

export const findOTP = async (email, code) => {
  const { rows } = await pool.query(
    "SELECT * FROM email_verifications WHERE email=$1 AND code=$2",
    [email, code]
  );
  return rows[0];
};

export const deleteOTP = async (email) => {
  await pool.query("DELETE FROM email_verifications WHERE email=$1", [email]);
};

// --- USER FUNCTIONS ---

export const findUserByEmail = async (email) => {
  const { rows } = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
  return rows[0];
};

export const createUser = async (email, passwordHash, firstName, lastName) => {
  const { rows } = await pool.query(
    "INSERT INTO users (email, password_hash, first_name, last_name, is_email_verified) VALUES ($1, $2, $3, $4, true) RETURNING id, email, first_name, last_name",
    [email, passwordHash, firstName, lastName]
  );
  return rows[0];
};

// ✅ UPDATED: Ab ye 'phone' bhi receive karega aur DB update karega
export const updateUserProfile = async (userId, firstName, lastName, phone) => {
  const { rows } = await pool.query(
    "UPDATE users SET first_name = $1, last_name = $2, phone_number = $3 WHERE id = $4 RETURNING id, first_name, last_name, email, phone_number",
    [firstName, lastName, phone, userId]
  );
  return rows[0];
};

export const deleteUserAccount = async (userId) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("DELETE FROM users WHERE id = $1", [userId]);
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

// --- ✅ ADDRESS FUNCTIONS (UPDATED) ---

// 1. Add New Address
export const addAddress = async (userId, addressData) => {
  const { fullName, addressLine, city, state, zipCode, country } = addressData;
  const { rows } = await pool.query(
    `INSERT INTO addresses (user_id, full_name, address_line, city, state, zip_code, country) 
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [userId, fullName, addressLine, city, state, zipCode, country || 'India']
  );
  return rows[0];
};

// 2. Update Address
export const updateAddressModel = async (addressId, userId, addressData) => {
  const { fullName, addressLine, city, state, zipCode, country } = addressData;
  const { rows } = await pool.query(
    `UPDATE addresses 
     SET full_name = $1, address_line = $2, city = $3, state = $4, zip_code = $5, country = $6
     WHERE id = $7 AND user_id = $8
     RETURNING *`,
    [fullName, addressLine, city, state, zipCode, country || 'India', addressId, userId]
  );
  return rows[0];
};

// 3. Delete Address
export const deleteAddressModel = async (addressId, userId) => {
  await pool.query(
    "DELETE FROM addresses WHERE id = $1 AND user_id = $2",
    [addressId, userId]
  );
};

// 4. Get Addresses
export const getUserAddresses = async (userId) => {
  const { rows } = await pool.query(
    "SELECT * FROM addresses WHERE user_id = $1 ORDER BY created_at DESC",
    [userId]
  );
  return rows;
};
import pkg from "pg";
const { Pool } = pkg;
import "dotenv/config"; // Ensure .env is loaded

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // .env file wala variable name
  ssl: { 
    rejectUnauthorized: false // Neon DB ke liye zaruri
  },
  // --- Timeout Settings (Fix for ETIMEDOUT) ---
  connectionTimeoutMillis: 20000, // 20 seconds wait karega connect hone ka
  idleTimeoutMillis: 30000,       // 30 seconds tak idle rehne par close karega
  max: 20,                        // Maximum 20 connections allow karega
});

// Error listener taaki server crash na ho
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export default pool;
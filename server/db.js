// src/db.js
import dotenv from "dotenv";
import pkg from "pg";

dotenv.config();

const { Pool } = pkg;

// Helper to handle Supabase SSL requirement
function falseLike(v) {
  if (!v) return false;
  return ["0", "false", "no", "off"].includes(String(v).toLowerCase());
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: !falseLike(process.env.PG_SSL_REJECT_UNAUTHORIZED),
  },
});

export default pool;

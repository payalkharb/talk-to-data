import pkg from "pg";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const { Pool } = pkg;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "./.env") });

const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL, // full pooler URL from Supabase dashboard
  ssl: { rejectUnauthorized: false }, // required for Supabase
});

// Debug
console.log("DB Connected via Session Pooler");

pool.on("error", (err) => {
  console.error("❌ Unexpected PG pool error:", err.message);
});

export default pool;

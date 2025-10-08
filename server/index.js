import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { nlToSql } from "./services/nlToSql.js";
import pool from "./db.js"; // ✅ reuse the shared pool

dotenv.config();

const app = express();
app.use(
  cors({
    origin: ["https://talk-to-data-frontend.onrender.com"],
  })
);

app.use(express.json());

// API route
app.post("/api/query", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt is required" });

  try {
    const { sql, from, error: sqlError } = await nlToSql(prompt);

    if (!sql) {
      return res.status(500).json({ error: sqlError || "No SQL generated" });
    }

    let rows = [];
    let queryError = null;
    try {
      const result = await pool.query(sql);
      rows = result.rows;
    } catch (e) {
      console.warn("⚠️ SQL execution error:", e.message);
      queryError = e.message;
    }

    res.json({
      sql,
      from,
      rows,
      answer: rows.length ? `Found ${rows.length} rows.` : "No results",
      error: queryError || sqlError,
    });
  } catch (e) {
    console.error("❌ Query error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);

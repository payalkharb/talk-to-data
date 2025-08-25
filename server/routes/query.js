// server/routes/query.js
import express from "express";
import pkg from "pg";
import { nlToSql } from "../services/nlToSql.js";

const { Pool } = pkg;
const router = express.Router();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

router.post("/query", async (req, res) => {
  try {
    const { prompt } = req.body;

    // Step 1: Convert NL -> SQL
    const { sql, from } = await nlToSql(
      prompt,
      "sales(city, sale_date, amount, category)"
    );

    // Step 2: Run SQL safely
    const result = await pool.query(sql);

    res.json({
      answer: `Fetched ${result.rowCount} row(s). (via ${from})`,
      sql,
      rows: result.rows,
    });
  } catch (error) {
    console.error("Query error:", error);
    res.status(500).json({ error: "Failed to process query" });
  }
});

export default router;

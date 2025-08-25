import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import pool from "./db.js"; // ⬅️ use centralized DB connection
import { nlToSql } from "./services/nlToSql.js";
import queryRoutes from "./routes/query.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

//Routes
app.use("/api", queryRoutes);

const PORT = process.env.PORT || 5000;

app.get("/api/health", async (_req, res) => {
  try {
    const r = await pool.query("select 1 as ok");
    res.json({ ok: true, db: r.rows[0].ok === 1 });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.post("/api/query", async (req, res) => {
  const { prompt } = req.body || {};
  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "prompt is required" });
  }

  try {
    // 1) Introspect schema
    const tables = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type='BASE TABLE'
      ORDER BY table_name
    `);

    let schemaDesc = "";
    for (const t of tables.rows) {
      const cols = await pool.query(
        "SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name=$1 ORDER BY ordinal_position",
        [t.table_name]
      );
      schemaDesc += `Table ${t.table_name} (${cols.rows
        .map((c) => c.column_name + ":" + c.data_type)
        .join(", ")});\n`;
    }

    // 2) Ask Hugging Face to build SQL
    const { sql, from } = await nlToSql(prompt, schemaDesc);

    // 3) Only allow SELECT for safety
    if (!/^\s*select\b/i.test(sql)) {
      return res
        .status(400)
        .json({ error: "Only SELECT queries are allowed for safety.", sql });
    }

    const { rows } = await pool.query(sql);

    // 4) Build friendly answer
    const answer = buildAnswer(prompt, rows);

    res.json({ answer, sql, rows, model: from });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

function buildAnswer(prompt, rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return `No results found for: "${prompt}".`;
  }

  const sample = rows[0];
  const keys = Object.keys(sample).map((k) => k.toLowerCase());
  const hasMonth = keys.includes("month") || keys.includes("sale_month");
  const hasTotal =
    keys.includes("total") ||
    keys.includes("total_amount") ||
    keys.includes("sum");

  if (hasMonth && hasTotal) {
    const total = rows.reduce(
      (s, r) =>
        s +
        Number(
          Object.values(r).find(
            (v, i) => Object.keys(r)[i].toLowerCase() === "total"
          ) ?? 0
        ),
      0
    );
    return `Found ${rows.length} month(s). Aggregate total ≈ ₹${Math.round(
      total
    ).toLocaleString("en-IN")}. See monthly chart below.`;
  }

  return `Fetched ${rows.length} row(s). Showing table below.`;
}

app.listen(PORT, () =>
  console.log(`API listening on http://localhost:${PORT}`)
);

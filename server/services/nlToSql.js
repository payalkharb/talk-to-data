// server/services/nlToSql.js
import fetch from "node-fetch";

const HF_URL =
  "https://api-inference.huggingface.co/models/defog/sqlcoder-7b-2";
const HF_API_KEY = process.env.HF_API_KEY;

// Fallback rule: e.g. "sales in 2023 in delhi"
function fallbackRule(question, schemaDesc) {
  const q = question.toLowerCase();
  const yearMatch = q.match(/\b(20\d{2}|19\d{2})\b/);
  const cityMatch =
    q.match(/in\s+([a-z\s]+)$/i) ||
    q.match(/in\s+([a-z\s]+?)\s+(for|of|by|section|category|$)/i);

  if (
    schemaDesc.includes("sales") &&
    (q.includes("sale") || q.includes("sales"))
  ) {
    const year = yearMatch ? yearMatch[0] : null;
    const city = cityMatch ? cityMatch[1].trim() : null;
    let where = [];
    if (year) where.push(`EXTRACT(YEAR FROM sale_date) = ${year}`);
    if (city) where.push(`LOWER(city) = LOWER('${city}')`);
    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
    const sql = `
      SELECT date_trunc('month', sale_date) AS month, SUM(amount) AS total
      FROM sales
      ${whereSql}
      GROUP BY 1
      ORDER BY 1
    `;
    return sql;
  }
  return null;
}

export async function nlToSql(question, schemaDesc = "") {
  // Try HuggingFace API
  if (HF_API_KEY) {
    try {
      const prompt = `Convert this into a PostgreSQL SELECT query.
Schema:
${schemaDesc}

Question: "${question}"

Rules:
- Output ONLY the SQL query (no markdown, no explanation).
- Use correct table/column names from schema.
- Use date_trunc for monthly aggregation.
`;

      const r = await fetch(HF_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: { max_new_tokens: 300 },
        }),
      });

      const raw = await r.text(); // <-- get raw response first
      console.log("HF raw output:", raw);

      let out;
      try {
        out = JSON.parse(raw); // only try parsing if JSON
      } catch {
        throw new Error("HF did not return JSON: " + raw);
      }

      let text = "";
      if (Array.isArray(out) && out[0]?.generated_text)
        text = out[0].generated_text;
      else if (out?.generated_text) text = out.generated_text;
      else if (typeof out === "string") text = out;

      text = String(text)
        .replace(/```sql|```/g, "")
        .trim();

      if (text && /^\s*select\b/i.test(text)) {
        return { sql: text, from: "hf" };
      }
    } catch (e) {
      console.warn("HF error, falling back:", e.message);
    }
  }

  // Fallback
  const fb = fallbackRule(question, schemaDesc);
  if (fb) return { sql: fb, from: "fallback" };

  // Safe default
  const safe = "SELECT 'No mapping available' AS message";
  return { sql: safe, from: "none" };
}

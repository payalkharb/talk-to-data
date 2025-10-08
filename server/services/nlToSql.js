import OpenAI from "openai";
import { getSchemaDescription } from "./getSchema.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper function to extract column names from schema
function extractColumnNames(schema) {
  const matches = schema.matchAll(/"([^"]+)"/g);
  const columns = [];
  for (const match of matches) {
    columns.push(match[1]);
  }
  return columns;
}

export async function nlToSql(question) {
  try {
    const schema = await getSchemaDescription();

    if (!schema || schema.length < 10) {
      return { sql: null, from: "openai", error: "Schema not available" };
    }

    const prompt = `
You are an expert SQL developer.
Generate only a SQL query (Postgres dialect) based on this schema:

${schema}

Question: "${question}"

Rules:
- Output ONLY the SQL query, no explanation, no markdown.
- Always wrap table and column names in double quotes.
- Do NOT add LIMIT unless explicitly asked in the question (e.g., "limit 5", "top 10").
`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
      max_tokens: 256,
    });

    const sql = response.choices[0]?.message?.content?.trim();

    if (!sql) {
      return { sql: null, from: "openai", error: "No SQL generated" };
    }

    console.log("🔹 Raw SQL from OpenAI:", sql);

    let cleanedSql = sql
      .replace(/```/g, "") // remove markdown fences
      .replace(/\s+/g, " ") // collapse whitespace
      .trim();

    // 🚫 Remove LIMIT unless user explicitly asked in the question
    if (!/limit\s*\d+/i.test(question) && !/top\s*\d+/i.test(question)) {
      cleanedSql = cleanedSql.replace(/\s+LIMIT\s+\d+/gi, "");
    }

    // Ensure exactly one semicolon at the end
    cleanedSql = cleanedSql.replace(/;+$/, "");
    cleanedSql = cleanedSql + ";";

    // ✅ Step: Extract columns from schema
    const columnNames = extractColumnNames(schema);

    // ✅ Step: Wrap column names in double quotes in SQL if not lowercase
    columnNames.forEach((col) => {
      const regex = new RegExp(`\\b${col}\\b`, "g");
      cleanedSql = cleanedSql.replace(regex, `"${col}"`);
    });

    console.log("✅ Final SQL sent to DB:", cleanedSql);

    return { sql: cleanedSql, from: "openai", error: null };
  } catch (err) {
    console.error("❌ nlToSql Error:", err.message);
    return { sql: null, from: "openai", error: err.message };
  }
}

import pool from "../db.js";

export async function getSchemaDescription() {
  try {
    const sql = `
      SELECT table_name, column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position;
    `;

    const result = await pool.query(sql);
    const rows = result.rows;

    if (!rows || rows.length === 0) {
      console.warn("⚠️ No schema found in public schema.");
      return "No tables available.";
    }

    // Group by table
    const tables = {};
    for (const r of rows) {
      if (!tables[r.table_name]) tables[r.table_name] = [];
      tables[r.table_name].push(`${r.column_name}:${r.data_type}`);
    }

    // Build schema string for LLM
    const desc = Object.entries(tables)
      .map(([table, cols]) => `Table ${table} (${cols.join(", ")})`)
      .join("\n");

    console.log("📘 Schema description for LLM:\n", desc);
    return desc;
  } catch (err) {
    console.error("❌ Error fetching schema:", err.message);
    return "Schema not available";
  }
}

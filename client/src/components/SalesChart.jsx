import React from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function SalesChart({ rows, type = "line" }) {
  if (!rows || rows.length === 0) return null;

  // Pick X-axis (date/month) and Y-axis (numeric) fields automatically
  const sample = rows[0];
  const xKey = Object.keys(sample).find((k) => /date|month|time/i.test(k));
  const yKey = Object.keys(sample).find(
    (k) => typeof sample[k] === "number" || /total|sum|amount|count/i.test(k)
  );

  // Fallback
  const xField = xKey || Object.keys(sample)[0];
  const yField = yKey || Object.keys(sample)[1];

  // Prepare data
  const data = rows.map((r) => ({
    [xField]: String(r[xField]).slice(0, 10),
    [yField]: Number(r[yField] || 0),
  }));

  return (
    <div style={{ width: "100%", height: 350, background: "#fff" }}>
      <ResponsiveContainer width="100%" height="100%">
        {type === "bar" ? (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xField} />
            <YAxis />
            <Tooltip />
            <Bar dataKey={yField} fill="#facc15" />
          </BarChart>
        ) : (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xField} />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey={yField} stroke="#f59e0b" dot />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

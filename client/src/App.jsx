import React, { useState, useRef } from "react";
import {
  FaDatabase,
  FaSearch,
  FaSpinner,
  FaExclamationCircle,
  FaCode,
  FaChartBar,
  FaTable,
} from "react-icons/fa";
import SalesChart from "./components/SalesChart.jsx";

const API_URL = "https://talk-to-data-cd0d.onrender.com/";

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState("");
  const [sql, setSql] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSQL, setShowSQL] = useState(true);

  const resultsRef = useRef(null);

  const ask = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError("");
    setAnswer("");
    setSql("");
    setRows([]);

    try {
      const r = await fetch(`${API_URL}/api/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Request failed");
      setAnswer(data.answer);
      setSql(data.sql);
      setRows(data.rows || []);

      // Scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-yellow-100 via-white to-yellow-50">
      <div className="max-w-5xl mx-auto p-8 font-sans">
        {/* Header */}
        <header className="flex items-center gap-2 text-3xl font-bold text-gray-800 mb-10">
          <FaDatabase className="text-yellow-500" />
          <span className="text-gray-900">Talk to Data</span>
        </header>

        {/* Input */}
        <div className="flex gap-2 mb-8">
          <input
            className="flex-1 px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Talk to your data (eg. Show sales in Sonipat in 2023)"
          />
          <button
            onClick={ask}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-yellow-500 text-gray-900 font-semibold rounded-xl shadow hover:bg-yellow-600 disabled:opacity-50 transition"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin" /> Thinking…
              </>
            ) : (
              <>
                <FaSearch /> Ask
              </>
            )}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 text-red-600 mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
            <FaExclamationCircle /> <span>{error}</span>
          </div>
        )}

        {/* SQL + Answer */}
        {(sql || answer) && (
          <div
            ref={resultsRef}
            className="bg-white shadow-md rounded-xl p-6 mb-8 border border-gray-100 relative"
          >
            {loading && (
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-xl">
                <FaSpinner className="animate-spin text-2xl text-yellow-500" />
              </div>
            )}
            {sql && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="flex items-center gap-2 text-gray-700 font-semibold">
                    <FaCode className="text-yellow-500" /> Generated SQL
                  </h2>
                  <button
                    className="text-sm text-blue-600 hover:underline"
                    onClick={() => setShowSQL(!showSQL)}
                  >
                    {showSQL ? "Hide" : "Show"}
                  </button>
                </div>
                {showSQL && (
                  <pre className="bg-gray-100 p-3 rounded-lg text-sm overflow-x-auto border border-gray-200 text-gray-800">
                    {sql}
                  </pre>
                )}
              </div>
            )}
            {answer && (
              <p className="text-lg font-medium text-gray-900">{answer}</p>
            )}
          </div>
        )}

        {/* Chart + Table */}
        {rows.length > 0 && (
          <div className="bg-white shadow-md rounded-xl p-6 border border-gray-100 mb-8">
            <h2 className="flex items-center gap-2 text-gray-800 font-semibold mb-4">
              <FaChartBar className="text-yellow-500" /> Results
            </h2>
            <SalesChart rows={rows} />

            <div className="mt-6 overflow-x-auto">
              <h3 className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                <FaTable className="text-yellow-500" /> Data Table
              </h3>
              <table className="w-full text-left border-collapse rounded-lg overflow-hidden shadow-sm">
                <thead className="bg-yellow-100 border-b">
                  <tr>
                    {Object.keys(rows[0]).map((k) => (
                      <th
                        key={k}
                        className="px-4 py-2 text-gray-800 font-semibold uppercase text-sm"
                      >
                        {k}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr
                      key={i}
                      className="odd:bg-white even:bg-gray-50 hover:bg-yellow-50 transition"
                    >
                      {Object.values(r).map((v, j) => (
                        <td
                          key={j}
                          className="px-4 py-2 text-gray-700 text-sm font-medium"
                        >
                          {String(v)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

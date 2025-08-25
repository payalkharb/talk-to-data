import React, { useState } from 'react'
import SalesChart from './components/SalesChart.jsx'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function App() {
  const [prompt, setPrompt] = useState('give me sales in 2023 in sonipat')
  const [answer, setAnswer] = useState('')
  const [sql, setSql] = useState('')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const ask = async () => {
    setLoading(true); setError(''); setAnswer(''); setSql(''); setRows([])
    try {
      const r = await fetch(`${API_URL}/api/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || 'Request failed')
      setAnswer(data.answer)
      setSql(data.sql)
      setRows(data.rows)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', fontFamily: 'system-ui, sans-serif' }}>
      <h1>🗣️ Talk to Data</h1>
      <p>Ask: <code>give me sales in 2023 in sonipat</code></p>

      <div style={{ display: 'flex', gap: 8 }}>
        <input
          style={{ flex: 1, padding: 12, fontSize: 16 }}
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="Ask a question about your data..."
        />
        <button onClick={ask} disabled={loading} style={{ padding: '12px 18px', fontSize: 16 }}>
          {loading ? 'Thinking…' : 'Ask'}
        </button>
      </div>

      {error && <p style={{ color: 'crimson' }}>Error: {error}</p>}
      {sql && (
        <div style={{ marginTop: 16 }}>
          <strong>SQL:</strong>
          <pre style={{ background: '#f6f8fa', padding: 12, borderRadius: 8, overflowX: 'auto' }}>{sql}</pre>
        </div>
      )}

      {answer && <p style={{ marginTop: 12 }}>{answer}</p>}

      {rows.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <SalesChart rows={rows} />
          <div style={{ marginTop: 20, overflowX: 'auto' }}>
            <table border="1" cellPadding="6">
              <thead>
                <tr>
                  {Object.keys(rows[0]).map(k => <th key={k}>{k}</th>)}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i}>
                    {Object.values(r).map((v, j) => <td key={j}>{String(v)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

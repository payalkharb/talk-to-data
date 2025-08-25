import React from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts'

export default function SalesChart({ rows }) {
  // Expect data like: { month: '2023-01-01', total: 12345 }
  const data = rows.map(r => ({
    month: (r.month || r.sale_month || r.date || '').slice(0, 10),
    total: Number(r.total || r.sum || r.total_amount || r.amount || 0)
  }))

  return (
    <div style={{ width: '100%', height: 350, background: '#fff' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="total" dot />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaLock } from "react-icons/fa";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    // Simple check – replace with real auth later
    if (password === "123") {
      navigate("/dashboard");
    } else {
      setError("Invalid password. Try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-100 via-white to-yellow-50">
      <div className="bg-white shadow-xl rounded-2xl p-10 w-full max-w-md border border-gray-100">
        <div className="flex flex-col items-center mb-6">
          <FaLock className="text-yellow-500 text-4xl mb-2" />
          <h1 className="text-2xl font-bold text-gray-800">Admin Login</h1>
          <p className="text-gray-500 text-sm">Enter password to continue</p>
        </div>

        {error && (
          <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 border border-red-300 rounded-lg">
            {error}
          </div>
        )}

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter admin password"
          className="w-full px-4 py-3 mb-4 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />

        <button
          onClick={handleLogin}
          className="w-full py-3 bg-yellow-500 text-gray-900 font-semibold rounded-xl shadow hover:bg-yellow-600 transition"
        >
          Login
        </button>
      </div>
    </div>
  );
}

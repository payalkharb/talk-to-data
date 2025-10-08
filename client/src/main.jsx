// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import AdminLogin from "./pages/AdminLogin";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminLogin />} /> {/* Default page */}
        <Route path="/dashboard" element={<App />} /> {/* Talk to Data */}
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

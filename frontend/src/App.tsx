import React from "react";

function App() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "#ffffff",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Arial, sans-serif",
        textAlign: "center",
        padding: "2rem",
      }}
    >
      <h1>🚀 Welcome to Zeikroncoin (ZKC)</h1>

      <p>
        A secure, scalable, and modern blockchain platform built with
        React, TypeScript, Node.js, PostgreSQL, Prisma, and Solidity.
      </p>

      <button
        style={{
          marginTop: "20px",
          padding: "12px 24px",
          fontSize: "16px",
          background: "#2563eb",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        Connect Wallet
      </button>
    </div>
  );
}

export default App;
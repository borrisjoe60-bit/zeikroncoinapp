import { FC, useCallback, useState } from 'react';
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from '@vercel/speed-insights/react';

// Extract styles outside component to prevent re-creation
const CONTAINER_STYLE: React.CSSProperties = {
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
};

const BUTTON_STYLE: React.CSSProperties = {
  marginTop: "20px",
  padding: "12px 24px",
  fontSize: "16px",
  background: "#2563eb",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  transition: "background-color 0.3s ease", // Add smooth hover
};

const BUTTON_HOVER_STYLE: React.CSSProperties = {
  ...BUTTON_STYLE,
  background: "#1d4ed8", // Darker on hover
};

interface AppProps {}

const App: FC<AppProps> = () => {
  // Memoize button click handler
  const handleConnectWallet = useCallback(async () => {
    console.log('Wallet connection initiated');
    // TODO: Implement wallet connection logic here
    
    // Track event in Vercel Analytics
    if (window && 'gtag' in window) {
      (window as any).gtag('event', 'wallet_connect_clicked');
    }
  }, []);

  const [isHovered, setIsHovered] = useState(false);

  return (
    <div style={CONTAINER_STYLE}>
      <h1>🚀 Welcome to Zeikroncoin (ZKC)</h1>

      <p>
        A secure, scalable, and modern blockchain platform built with
        React, TypeScript, Node.js, PostgreSQL, Prisma, and Solidity.
      </p>

      <button
        onClick={handleConnectWallet}
        style={isHovered ? BUTTON_HOVER_STYLE : BUTTON_STYLE}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label="Connect cryptocurrency wallet"
      >
        Connect Wallet
      </button>

      <Analytics />
      <SpeedInsights />
    </div>
  );
};

export default App;

import React from 'react';
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <>
      <div>
        <h1>Zeikroncoin (ZKC)</h1>
        <p>Welcome to Zeikroncoin</p>
      </div>
      {import.meta.env.PROD && <Analytics />}
    </>
  );
}

export default App;

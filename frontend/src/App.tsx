import React from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

function App(): JSX.Element {
  return (
    <>
      <div>
        <h1>Zeikroncoin (ZKC)</h1>
        <p>Welcome to Zeikroncoin</p>
      </div>
      {import.meta.env.PROD && <Analytics />}
      {import.meta.env.PROD && <SpeedInsights />}
    </>
  );
}

export default App;

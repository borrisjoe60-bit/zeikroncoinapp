import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

function App() {
  return (
    <>
      <div>
        <h1>Zicron (ZCR)</h1>
        <p>Welcome to Zicron</p>
      </div>
      {import.meta.env.PROD && <Analytics />}
      {import.meta.env.PROD && <SpeedInsights />}
    </>
  );
}

export default App;

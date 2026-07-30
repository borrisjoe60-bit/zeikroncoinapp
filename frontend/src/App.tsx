import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

function App() {
  return (
    <>
      <div>
        <h1>Zeikroncoin (ZKC)</h1>
        <p>Welcome to Zeikroncoin</p>
      </div>
      <Analytics />
      <SpeedInsights />
    </>
  );
}

export default App;

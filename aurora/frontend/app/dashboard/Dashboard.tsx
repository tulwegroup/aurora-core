"use client";

import { useEffect, useState } from "react";
import { getDiscoveries, startScan } from "../../lib/api";

export default function Dashboard() {
  const [discoveries, setDiscoveries] = useState<any[]>([]);

  useEffect(() => {
    getDiscoveries()
      .then(setDiscoveries)
      .catch(console.error);
  }, []);

  return (
    <main style={{ padding: 40 }}>
      <h1>Aurora Core</h1>

      <button onClick={startScan}>Start Scan</button>

      <div>
        {discoveries.map((d) => (
          <div key={d.commodity}>
            {d.commodity} — {d.location} (
            {Math.round(d.probability * 100)}%)
          </div>
        ))}
      </div>
    </main>
  );
}

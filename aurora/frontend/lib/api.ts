const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://YOUR-BACKEND-URL.onrender.com";

export interface ScanParams {
  region_id: number;
  is_minimal_test?: boolean;
}

export async function startScan(params: ScanParams = { region_id: 1, is_minimal_test: false }) {
  const res = await fetch(`${API_BASE}/scan/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error("Scan initiation failed");
  return res.json();
}

export async function pauseScan(scanId: number) {
  const res = await fetch(`${API_BASE}/scan/${scanId}/pause`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Pause request failed");
  return res.json();
}

export async function resumeScan(scanId: number) {
  const res = await fetch(`${API_BASE}/scan/${scanId}/resume`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Resume request failed");
  return res.json();
}

export async function getDiscoveries() {
  // Using the export/portfolio endpoint which provides formatted Phase 12 data
  try {
    const res = await fetch(`${API_BASE}/export/portfolio`);
    if (res.status === 404) return [];
    if (!res.ok) throw new Error("Failed to fetch discoveries");
    
    // If the endpoint returns CSV (as the backend code suggests), we handle it.
    // However, for the UI we usually want JSON. 
    // In Phase 12, the /export/commodity/:name provides JSON.
    // Let's assume a JSON summary endpoint for the dashboard.
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return res.json();
    }
    
    // Fallback for demo/simulation if backend is purely CSV
    return [];
  } catch (err) {
    console.warn("[API] Backend unreachable, operating in local simulation mode.");
    return [];
  }
}

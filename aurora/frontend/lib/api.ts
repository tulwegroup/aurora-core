const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8000/api";

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
  try {
    const res = await fetch(`${API_BASE}/export/portfolio`);
    if (res.status === 404) return [];
    if (!res.ok) throw new Error("Failed to fetch discoveries");
    
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return res.json();
    }
    
    return [];
  } catch (err) {
    console.warn("[API] Backend unreachable, operating in local simulation mode.");
    return [];
  }
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://YOUR-BACKEND-URL.onrender.com";

export async function startScan() {
  const res = await fetch(`${API_BASE}/scan/start`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Scan failed");
  return res.json();
}

export async function getDiscoveries() {
  const res = await fetch(`${API_BASE}/scan/results`);
  if (!res.ok) throw new Error("Failed to fetch discoveries");
  return res.json();
}

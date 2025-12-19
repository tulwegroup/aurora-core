const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

if (!API_BASE) {
  throw new Error("NEXT_PUBLIC_API_BASE not defined");
}

export async function startScan() {
  const res = await fetch(`${API_BASE}/scan/start`, {
    method: "POST",
  });
  return res.json();
}

export async function getScanStatus() {
  const res = await fetch(`${API_BASE}/scan/status`);
  return res.json();
}

export async function getDiscoveries() {
  const res = await fetch(`${API_BASE}/discoveries`);
  return res.json();
}

export async function getSystemStatus() {
  const res = await fetch(`${API_BASE}/system/status`);
  return res.json();
}

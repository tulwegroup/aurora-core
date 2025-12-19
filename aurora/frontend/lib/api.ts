const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8000/api";

export interface ScanParams {
  region_id: number;
  is_minimal_test?: boolean;
}

// Helper function to handle fetch with proper error handling
async function apiFetch(url: string, options?: RequestInit) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    return response;
  } catch (error) {
    console.error('API fetch error:', error);
    throw error;
  }
}

export async function startScan(params: ScanParams = { region_id: 1, is_minimal_test: false }) {
  try {
    const res = await apiFetch(`${API_BASE}/scan/start`, {
      method: "POST",
      body: JSON.stringify(params),
    });
    return res.json();
  } catch (error) {
    console.error('Failed to start scan:', error);
    // Return a mock response for demo purposes
    return { scan_id: Math.floor(Math.random() * 10000), status: "mock" };
  }
}

export async function pauseScan(scanId: number) {
  try {
    const res = await apiFetch(`${API_BASE}/scan/${scanId}/pause`, {
      method: "POST",
    });
    return res.json();
  } catch (error) {
    console.error('Failed to pause scan:', error);
    return { status: "mock_paused" };
  }
}

export async function resumeScan(scanId: number) {
  try {
    const res = await apiFetch(`${API_BASE}/scan/${scanId}/resume`, {
      method: "POST",
    });
    return res.json();
  } catch (error) {
    console.error('Failed to resume scan:', error);
    return { status: "mock_resumed" };
  }
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
    // Return mock data for demo purposes
    return [
      {
        id: 1,
        commodity: "Lithium",
        probability: 0.92,
        lat: -23.6,
        lng: -70.4,
        region: "Antofagasta",
        ere: "124.5 Mt"
      },
      {
        id: 2,
        commodity: "Copper",
        probability: 0.87,
        lat: -21.3,
        lng: 119.1,
        region: "Pilbara",
        ere: "89.2 Mt"
      },
      {
        id: 3,
        commodity: "Cobalt",
        probability: 0.78,
        lat: 33.3,
        lng: -115.8,
        region: "Salton Sea",
        ere: "45.7 Mt"
      }
    ];
  }
}

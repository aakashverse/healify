import { API_BASE } from "../utils/api.client";

export async function fetchFacilities() {
  try {
    const response = await fetch(`${API_BASE}/facilities`);
    if (!response.ok) {
      throw new Error(`Failed to fetch facilities: ${response.status}`);
    }
    return await response.json();
  } catch (err) {
    console.error('Facilities API Error:', err);
    throw err;
  }
}

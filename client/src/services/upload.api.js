import { API_BASE } from "../utils/api.client";

export async function uploadPrescription(file) {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText || `Failed to analyze image: ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    console.error('Prescription Upload Error:', err);
    throw err;
  }
}

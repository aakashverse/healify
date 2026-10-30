import { API_BASE } from "../utils/api.client";

export async function explainPrescriptionBase64(imageBase64, mimeType = 'image/jpeg', fileName = '') {
  try {
    const response = await fetch(`${API_BASE}/explain`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_base64: imageBase64,
        mime_type: mimeType,
        file_name: fileName,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText || `Failed to explain image: ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    console.error('Prescription Explain Error:', err);
    throw err;
  }
}

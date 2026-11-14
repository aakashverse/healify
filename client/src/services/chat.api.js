import { API_BASE } from "../utils/api.client";

export async function sendChatMessage(message, history = []) {
  try {
    const response = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, history }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Server responded with ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    console.error('Chat API Error:', err);
    throw err;
  }
}

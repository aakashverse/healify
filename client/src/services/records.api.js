import { API_BASE } from "../utils/api.client";

function getAuthHeaders() {
  const token = localStorage.getItem("healu_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export async function fetchHealthRecords({ type = "all", search = "" } = {}) {
  try {
    const params = new URLSearchParams();
    if (type && type !== "all") params.append("type", type);
    if (search && search.trim()) params.append("search", search.trim());

    const queryString = params.toString() ? `?${params.toString()}` : "";
    const response = await fetch(`${API_BASE}/api/records${queryString}`, {
      method: "GET",
      headers: getAuthHeaders()
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || `Failed to fetch records (${response.status})`);
    }

    return data.data || [];
  } catch (error) {
    console.error("fetchHealthRecords error:", error);
    throw error;
  }
}

export async function fetchHealthRecordById(id) {
  try {
    const response = await fetch(`${API_BASE}/api/records/${id}`, {
      method: "GET",
      headers: getAuthHeaders()
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Record not found");
    }

    return data.data;
  } catch (error) {
    console.error("fetchHealthRecordById error:", error);
    throw error;
  }
}

export async function createHealthRecord(recordData) {
  try {
    const response = await fetch(`${API_BASE}/api/records`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(recordData)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to create record");
    }

    return data.data;
  } catch (error) {
    console.error("createHealthRecord error:", error);
    throw error;
  }
}

export async function updateHealthRecord(id, recordData) {
  try {
    const response = await fetch(`${API_BASE}/api/records/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(recordData)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to update record");
    }

    return data.data;
  } catch (error) {
    console.error("updateHealthRecord error:", error);
    throw error;
  }
}

export async function deleteHealthRecord(id) {
  try {
    const response = await fetch(`${API_BASE}/api/records/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders()
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to delete record");
    }

    return true;
  } catch (error) {
    console.error("deleteHealthRecord error:", error);
    throw error;
  }
}

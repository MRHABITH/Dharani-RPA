const BASE_URL = "http://127.0.0.1:8000";

export const startTask = async (data) => {
  try {
    const res = await fetch(`${BASE_URL}/start`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(data)
    });
    
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    throw new Error(`Failed to start task: ${err.message}`);
  }
};

export const stopTask = async (id) => {
  try {
    const res = await fetch(`${BASE_URL}/stop/${id}`, {
      method: "POST"
    });
    
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    throw new Error(`Failed to stop task: ${err.message}`);
  }
};

export const getStatus = async (id) => {
  try {
    const res = await fetch(`${BASE_URL}/status/${id}`);
    
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    throw new Error(`Failed to get status: ${err.message}`);
  }
};
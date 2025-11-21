import { BACKEND_URL } from "./config.js";

async function request(path, options = {}) {
  if (!BACKEND_URL) {
    throw new Error("BACKEND_URL is not set in app.json");
  }

  const url = `${BACKEND_URL}${path}`;
  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || `Request failed with status ${response.status}`);
    }

    return response.status === 204 ? null : response.json();
  } catch (err) {
    // Add more context for network errors to help debugging in Expo
    console.error(`API request failed: ${url}`, err.message || err);
    throw new Error(`${err.message || err} (url: ${url})`);
  }
}

export const Api = {
  getSensorReadings() {
    return request("/api/readings");
  },
  getThresholds() {
    return request("/api/thresholds");
  },
  createThreshold(payload) {
    return request("/api/thresholds", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  authLogin(payload) {
    return request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  validateToken(token) {
    return request("/api/auth/validate", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
  },
  // helper to include token automatically
  withToken(token) {
    return {
      createThreshold(payload) {
        return request("/api/thresholds", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
      },
    };
  },
};

import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra || {};
// Must match app.config.js DEFAULT_API_BASE_URL; block stale ngrok baked into cached config.
const DEFAULT_API_BASE_URL = "https://hospital-backend-9mg3.onrender.com";
function resolveBaseUrl() {
  let raw = extra.API_BASE_URL || DEFAULT_API_BASE_URL;
  raw = String(raw).trim();
  if (!raw || /ngrok/i.test(raw)) {
    return DEFAULT_API_BASE_URL;
  }
  return raw.replace(/\/+$/, "");
}
const BASE_URL = resolveBaseUrl();
const HOSPITAL_ID = extra.HOSPITAL_ID || "apollo";

class ApiService {
  constructor() {
    this.baseURL = BASE_URL;
    this.hospitalId = HOSPITAL_ID;
  }

  getHeaders(customHeaders = {}) {
    return {
      'Content-Type': 'application/json',
      'X-Hospital-ID': this.hospitalId,
      ...customHeaders,
    };
  }

  async get(endpoint, headers = {}) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(headers),
    });
    return this.handleResponse(response);
  }

  async post(endpoint, data, headers = {}) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(headers),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async put(endpoint, data, headers = {}) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(headers),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async delete(endpoint, headers = {}) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(headers),
    });
    return this.handleResponse(response);
  }

  async adminStaffLogin(email, password) {
    return this.post('/api/v1/auth/login', { email, password });
  }

  async patientLogin(email, password) {
    return this.post('/api/v1/auth/patient/login', { email, password });
  }

  async getMe(token) {
    return this.get('/api/v1/auth/me', {
      Authorization: `Bearer ${token}`,
    });
  }

  async handleResponse(response) {
    const responseText = await response.text();
    let responseData = {};

    if (responseText) {
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        if (!response.ok) {
          throw new Error(responseText || 'API request failed');
        }
      }
    }

    if (!response.ok) {
      const detail = responseData?.detail;
      const nestedMessage =
        (typeof detail === 'object' && detail?.message) ||
        (typeof responseData?.error === 'object' && responseData?.error?.message);
      throw new Error(nestedMessage || responseData?.message || 'API request failed');
    }

    if (responseData && responseData.success === true && Object.prototype.hasOwnProperty.call(responseData, 'data')) {
      return responseData.data;
    }

    return responseData;
  }
}

export const api = new ApiService();

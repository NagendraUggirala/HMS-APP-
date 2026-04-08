import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

  async getHeaders(customHeaders = {}) {
    let token = null;
    try {
      token = await AsyncStorage.getItem('authToken');
      console.log(`[ApiService] Token exists: ${!!token}`);
    } catch (e) {
      console.warn("Failed to retrieve token for API call", e);
    }
    
    return {
      'Content-Type': 'application/json',
      'X-Hospital-ID': this.hospitalId,
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...customHeaders,
    };
  }

  async get(endpoint, headers = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
    const resolvedHeaders = await this.getHeaders(headers);
    const response = await fetch(url, {
      method: 'GET',
      headers: resolvedHeaders,
    });
    return this.handleResponse(response);
  }

  async post(endpoint, data, headers = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
    const resolvedHeaders = await this.getHeaders(headers);
    const response = await fetch(url, {
      method: 'POST',
      headers: resolvedHeaders,
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async put(endpoint, data, headers = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
    const resolvedHeaders = await this.getHeaders(headers);
    const response = await fetch(url, {
      method: 'PUT',
      headers: resolvedHeaders,
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async delete(endpoint, headers = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
    const resolvedHeaders = await this.getHeaders(headers);
    const response = await fetch(url, {
      method: 'DELETE',
      headers: resolvedHeaders,
    });
    return this.handleResponse(response);
  }

  async patch(endpoint, data, headers = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
    const resolvedHeaders = await this.getHeaders(headers);
    const response = await fetch(url, {
      method: 'PATCH',
      headers: resolvedHeaders,
      body: JSON.stringify(data),
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

    if (!response.ok && response.status !== 304) {
      const detail = responseData?.detail;
      const nestedMessage =
        (typeof detail === 'object' && detail?.message) ||
        (typeof responseData?.error === 'object' && responseData?.error?.message);
      
      const errorMessage = nestedMessage || responseData?.message || 'API request failed';
      console.warn(`[API ERROR] ${response.status} on Endpoint: ${response.url} - ${errorMessage}`);
      throw new Error(errorMessage);
    }

    if (responseData && responseData.success === true && Object.prototype.hasOwnProperty.call(responseData, 'data')) {
      return responseData.data;
    }

    return responseData;
  }
}

export const api = new ApiService();

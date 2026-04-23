import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const extra = Constants.expoConfig?.extra || {};
// Must match app.config.js DEFAULT_API_BASE_URL; block stale ngrok baked into cached config.
const DEFAULT_API_BASE_URL = "http://localhost:3000";
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
    this.onUnauthorized = null;
  }

  setUnauthorizedCallback(callback) {
    this.onUnauthorized = callback;
  }

  async getHeaders(customHeaders = {}) {
    let token = null;
    let storedHospitalId = null;
    try {
      token = await AsyncStorage.getItem('authToken');
      const storedUser = await AsyncStorage.getItem('currentUser');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        storedHospitalId = user.hospitalId;
      }
    } catch (e) {
      console.warn("Failed to retrieve auth data from storage", e);
    }
    
    return {
      'Content-Type': 'application/json',
      'X-Hospital-ID': storedHospitalId || this.hospitalId,
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

  async getReceptionistDashboard() {
    return this.get('/api/v1/receptionist/dashboard');
  }

  async getReceptionistProfile() {
    return this.get('/api/v1/receptionist/profile');
  }

  async getNurseProfile() {
    return this.get('/api/v1/nurse/profile');
  }

  async getStaffTickets(skip = 0, limit = 50, completedOnly = false) {
    return this.get(`/api/v1/support/staff/tickets?skip=${skip}&limit=${limit}&completed_only=${completedOnly}`);
  }

  async createSupportTicket(data) {
    return this.post('/api/v1/support/staff/tickets', data);
  }

  async registerPatient(data) {
    return this.post('/api/v1/receptionist/patients/register', data);
  }

  async getAllPatientsDebug() {
    return this.get('/api/v1/ipd-management/debug/all-patients');
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
      
      if (response.status === 401 && this.onUnauthorized) {
        this.onUnauthorized();
      }
      
      throw new Error(errorMessage);
    }

    if (responseData && responseData.success === true && Object.prototype.hasOwnProperty.call(responseData, 'data')) {
      return responseData.data;
    }

    return responseData;
  }
}

export const api = new ApiService();

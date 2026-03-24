import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra || {};
const BASE_URL = extra.API_BASE_URL || "https://api.example.com";
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

  async handleResponse(response) {
    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        throw new Error(errorText || 'API request failed');
      }
      throw new Error(errorData.message || 'API request failed');
    }
    return response.json();
  }
}

export const api = new ApiService();

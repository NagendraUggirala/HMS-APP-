import { api } from './api';

/**
 * Doctor Appointment Tracking API Services
 */

export const getTodaysAppointmentTracking = () => {
  return api.get('/api/v1/doctor-appointment-tracking/appointments/today');
};

export const getAppointmentTrackingDetails = (appointmentRef) => {
  return api.get(`/api/v1/doctor-appointment-tracking/appointments/${appointmentRef}/tracking`);
};

export const getUpcomingAppointmentsTracking = (daysAhead = 7) => {
  return api.get(`/api/v1/doctor-appointment-tracking/appointments/upcoming?days_ahead=${daysAhead}`);
};

export const sendAppointmentNotification = (data) => {
  return api.post('/api/v1/doctor-appointment-tracking/notifications/send', data);
};

export const sendBulkAppointmentNotifications = (data) => {
  return api.post('/api/v1/doctor-appointment-tracking/notifications/bulk-send', data);
};

const cleanFilters = (filters) => {
  const clean = {};
  Object.keys(filters).forEach(key => {
    if (filters[key] !== '' && filters[key] !== null && filters[key] !== undefined) {
      clean[key] = filters[key];
    }
  });
  return clean;
};

export const getNotificationHistory = (filters = {}) => {
  const query = new URLSearchParams(cleanFilters(filters)).toString();
  return api.get(`/api/v1/doctor-appointment-tracking/notifications/history${query ? `?${query}` : ''}`);
};

export const updateAppointmentDelay = (appointmentRef, data) => {
  return api.post(`/api/v1/doctor-appointment-tracking/appointments/${appointmentRef}/delay`, data);
};

export const getTodaysAppointmentDelays = () => {
  return api.get('/api/v1/doctor-appointment-tracking/appointments/delays/today');
};

export const getCommunicationLog = (filters = {}) => {
  const query = new URLSearchParams(cleanFilters(filters)).toString();
  return api.get(`/api/v1/doctor-appointment-tracking/communication/log${query ? `?${query}` : ''}`);
};

export const createCommunicationLogEntry = (data) => {
  return api.post('/api/v1/doctor-appointment-tracking/communication/log', data);
};

export const getAppointmentMetricsSummary = (period = 'month') => {
  return api.get(`/api/v1/doctor-appointment-tracking/metrics/summary?period=${period}`);
};

export const doctorAppointmentErrorMessage = (error) => {
  return error?.message || 'An error occurred while processing the request.';
};

/**
 * Doctor Patient Records & Lookup API Services
 */

export const searchDoctorPatients = (params) => {
  const query = new URLSearchParams(cleanFilters(params)).toString();
  return api.get(`/api/v1/doctor/patients/search${query ? `?${query}` : ''}`);
};

export const advancedSearchDoctorPatients = (searchRequest, filters) => {
  return api.post('/api/v1/doctor/patients/advanced-search', { ...searchRequest, filters });
};

export const getDoctorAllMedicalRecords = (params) => {
  const query = new URLSearchParams(cleanFilters(params)).toString();
  return api.get(`/api/v1/doctor/medical-records/all${query ? `?${query}` : ''}`);
};

export const getDoctorPatientSummary = (patientRef) => {
  return api.get(`/api/v1/doctor/patients/${patientRef}/summary`);
};

export const getDoctorPatientMedicalRecords = (patientRef, params = {}) => {
  const query = new URLSearchParams(cleanFilters(params)).toString();
  return api.get(`/api/v1/doctor/patients/${patientRef}/medical-records${query ? `?${query}` : ''}`);
};

export const getDoctorPatientTimeline = (patientRef, params = {}) => {
  const query = new URLSearchParams(cleanFilters(params)).toString();
  return api.get(`/api/v1/doctor/patients/${patientRef}/timeline${query ? `?${query}` : ''}`);
};

export const getDoctorPatientCaseHistory = (patientRef, period = '1year') => {
  return api.get(`/api/v1/doctor/patients/${patientRef}/case-history?period=${period}`);
};

export const getDoctorPatientClinicalAlerts = (patientRef, activeOnly = true) => {
  return api.get(`/api/v1/doctor/patients/${patientRef}/clinical-alerts?active_only=${activeOnly}`);
};

export const getDoctorPatientDocuments = (patientRef) => {
  return api.get(`/api/v1/doctor/patients/${patientRef}/documents`);
};

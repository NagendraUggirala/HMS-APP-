import { api } from './api';

/**
 * Pharmacy API Service for Mobile App
 * Integrates with the backend pharmacy module.
 */

// API Endpoints
const PHARMACY_BASE = '/api/v1/pharmacy';
const PHARMACY_REPORTS_SALES_SUMMARY = `${PHARMACY_BASE}/reports/sales-summary`;
const PHARMACY_REPORTS_STOCK_VALUATION = `${PHARMACY_BASE}/reports/stock-valuation`;
const PHARMACY_REPORTS_EXPIRY = `${PHARMACY_BASE}/reports/expiry`;
const PHARMACY_REPORTS_FAST_SLOW_MOVING = `${PHARMACY_BASE}/reports/fast-slow-moving`;
const PHARMACY_REPORTS_PROFIT_MARGINS = `${PHARMACY_BASE}/reports/profit-margins`;
const PHARMACY_INVENTORY_BASE = `${PHARMACY_BASE}/inventory`;
const PHARMACY_MEDICINES_BASE = `${PHARMACY_BASE}/medicines`;
const PHARMACY_SUPPLIERS_BASE = `${PHARMACY_BASE}/suppliers`;
const PHARMACY_PURCHASE_ORDERS_BASE = `${PHARMACY_BASE}/purchase-orders`;
const PHARMACY_GRN_BASE = `${PHARMACY_BASE}/grn`;
const PHARMACY_STOCK_BASE = `${PHARMACY_BASE}/stock`;
const PHARMACY_SALES_BASE = `${PHARMACY_BASE}/sales`;
const PHARMACY_RETURNS_BASE = `${PHARMACY_BASE}/returns`;
const PHARMACY_ALERTS_BASE = `${PHARMACY_BASE}/alerts`;
const PHARMACY_DASHBOARD_OVERVIEW = `${PHARMACY_BASE}/dashboard/overview`;
const PHARMACY_SETTINGS_BASE = `${PHARMACY_BASE}/settings`;

/**
 * Helper to build query string from object
 */
function withQuery(path, queryObj = {}) {
  const query = [];
  Object.entries(queryObj).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      query.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
    }
  });
  const queryString = query.join('&');
  return queryString ? `${path}?${queryString}` : path;
}

// --- REPORTS ---
export async function getSalesSummary(fromDate, toDate, groupBy = 'day') {
  const f = fromDate ? `${fromDate} 00:00:00` : undefined;
  const t = toDate ? `${toDate} 23:59:59` : undefined;
  const path = withQuery(PHARMACY_REPORTS_SALES_SUMMARY, {
    from_date: f,
    to_date: t,
    group_by: groupBy
  });
  return api.get(path);
}

export async function getStockValuation() {
  return api.get(PHARMACY_REPORTS_STOCK_VALUATION);
}

export async function getExpiryReport() {
  return api.get(PHARMACY_REPORTS_EXPIRY);
}

export async function getFastSlowMovingReport(fromDate, toDate) {
  const f = fromDate ? `${fromDate} 00:00:00` : undefined;
  const t = toDate ? `${toDate} 23:59:59` : undefined;
  const path = withQuery(PHARMACY_REPORTS_FAST_SLOW_MOVING, {
    from_date: f,
    to_date: t
  });
  return api.get(path);
}

export async function getProfitMarginsReport(fromDate, toDate) {
  const f = fromDate ? `${fromDate} 00:00:00` : undefined;
  const t = toDate ? `${toDate} 23:59:59` : undefined;
  const path = withQuery(PHARMACY_REPORTS_PROFIT_MARGINS, {
    from_date: f,
    to_date: t
  });
  return api.get(path);
}

// --- INVENTORY ---
export async function getInventory(skip = 0, limit = 100) {
  const path = withQuery(PHARMACY_INVENTORY_BASE, { skip, limit });
  return api.get(path);
}

// --- MEDICINES ---
export async function getMedicines(skip = 0, limit = 100, search = '', category = '', status = '') {
  const path = withQuery(PHARMACY_MEDICINES_BASE, { skip, limit, search, category, status });
  return api.get(path);
}

export async function getMedicine(id) {
  return api.get(`${PHARMACY_MEDICINES_BASE}/${id}`);
}

export async function createMedicine(data) {
  return api.post(PHARMACY_MEDICINES_BASE, data);
}

export async function updateMedicine(id, data) {
  return api.put(`${PHARMACY_MEDICINES_BASE}/${id}`, data);
}

export async function deleteMedicine(id) {
  return api.delete(`${PHARMACY_MEDICINES_BASE}/${id}`);
}

// --- SUPPLIERS ---
export async function getSuppliers(skip = 0, limit = 100) {
  const path = withQuery(PHARMACY_SUPPLIERS_BASE, { skip, limit });
  return api.get(path);
}

export async function createSupplier(data) {
  return api.post(PHARMACY_SUPPLIERS_BASE, data);
}

export async function updateSupplier(id, data) {
  return api.put(`${PHARMACY_SUPPLIERS_BASE}/${id}`, data);
}

export async function deleteSupplier(id) {
  return api.delete(`${PHARMACY_SUPPLIERS_BASE}/${id}`);
}

// --- DASHBOARD ---
export async function getDashboardOverview() {
  return api.get(PHARMACY_DASHBOARD_OVERVIEW);
}

// --- PURCHASE ORDERS ---
export async function getPurchaseOrders(status = '', supplierId = '', skip = 0, limit = 100) {
  const path = withQuery(PHARMACY_PURCHASE_ORDERS_BASE, { status, supplier_id: supplierId, skip, limit });
  return api.get(path);
}

export async function getPurchaseOrder(id) {
  return api.get(`${PHARMACY_PURCHASE_ORDERS_BASE}/${id}`);
}

export async function createPurchaseOrder(data) {
  return api.post(PHARMACY_PURCHASE_ORDERS_BASE, data);
}

export async function updatePurchaseOrder(id, data) {
  return api.put(`${PHARMACY_PURCHASE_ORDERS_BASE}/${id}`, data);
}

export async function submitPurchaseOrder(id) {
  return api.post(`${PHARMACY_PURCHASE_ORDERS_BASE}/${id}/submit`, {});
}

export async function approvePurchaseOrder(id) {
  return api.post(`${PHARMACY_PURCHASE_ORDERS_BASE}/${id}/approve`, {});
}

export async function sendPurchaseOrder(id) {
  return api.post(`${PHARMACY_PURCHASE_ORDERS_BASE}/${id}/send`, {});
}

export async function cancelPurchaseOrder(id, reason) {
  return api.post(`${PHARMACY_PURCHASE_ORDERS_BASE}/${id}/cancel`, { reason });
}

export async function deletePurchaseOrder(id) {
  return api.delete(`${PHARMACY_PURCHASE_ORDERS_BASE}/${id}`);
}

// --- GRN ---
export async function createGRN(data) {
  const payload = {
    received_at: new Date().toISOString(),
    ...data
  };
  return api.post(PHARMACY_GRN_BASE, payload);
}

export async function getGRNs(supplierId = '', skip = 0, limit = 100) {
  const path = withQuery(PHARMACY_GRN_BASE, { supplier_id: supplierId, skip, limit });
  return api.get(path);
}

export async function getGRN(id) {
  return api.get(`${PHARMACY_GRN_BASE}/${id}`);
}

export async function addGRNItem(grnId, data) {
  return api.post(`${PHARMACY_GRN_BASE}/${grnId}/items`, data);
}

export async function finalizeGRN(id) {
  return api.post(`${PHARMACY_GRN_BASE}/${id}/finalize`, {});
}

// --- STOCK ---
export async function getStockBatches(medicineId = '', lowStock = false, expiringInDays = null, skip = 0, limit = 100) {
  const path = withQuery(PHARMACY_STOCK_BASE, {
    medicine_id: medicineId,
    low_stock: lowStock,
    expiring_in_days: expiringInDays,
    skip,
    limit
  });
  return api.get(path);
}

export async function createStockAdjustment(data) {
  return api.post(`${PHARMACY_STOCK_BASE}/adjustments`, data);
}

export async function getStockLedger(medicineId = '', txnType = '', fromDate = '', toDate = '', skip = 0, limit = 100) {
  const path = withQuery(`${PHARMACY_STOCK_BASE}/ledger`, {
    medicine_id: medicineId,
    txn_type: txnType,
    from_date: fromDate,
    to_date: toDate,
    skip,
    limit
  });
  return api.get(path);
}

// --- SALES ---
export async function getSales(patientId = '', status = '', fromDate = '', toDate = '', skip = 0, limit = 100) {
  const path = withQuery(PHARMACY_SALES_BASE, { patient_id: patientId, status, from_date: fromDate, to_date: toDate, skip, limit });
  return api.get(path);
}

export async function createSale(data) {
  return api.post(PHARMACY_SALES_BASE, data);
}

export async function getSale(id) {
  return api.get(`${PHARMACY_SALES_BASE}/${id}`);
}

export async function addSaleItem(saleId, data) {
  return api.post(`${PHARMACY_SALES_BASE}/${saleId}/items`, data);
}

export async function completeSale(saleId) {
  return api.post(`${PHARMACY_SALES_BASE}/${saleId}/complete`, {});
}

export async function voidSale(saleId, reason) {
  return api.post(`${PHARMACY_SALES_BASE}/${saleId}/void`, { reason });
}

export async function getSaleReceipt(saleId) {
  return api.get(`${PHARMACY_SALES_BASE}/${saleId}/receipt`);
}

// --- RETURNS ---
export async function getReturns(type = '', skip = 0, limit = 100) {
  const path = withQuery(PHARMACY_RETURNS_BASE, { return_type: type, skip, limit });
  return api.get(path);
}

export async function createPatientReturn(data) {
  return api.post(`${PHARMACY_RETURNS_BASE}/patient`, data);
}

export async function createSupplierReturn(data) {
  return api.post(`${PHARMACY_RETURNS_BASE}/supplier`, data);
}

// --- ALERTS ---
export async function getAlerts(skip = 0, limit = 100, alertType = '', status = '') {
  const path = withQuery(PHARMACY_ALERTS_BASE, { skip, limit, alert_type: alertType, status });
  return api.get(path);
}

export async function acknowledgeAlert(alertId) {
  return api.post(`${PHARMACY_ALERTS_BASE}/${alertId}/ack`, {});
}

export async function runExpiryScan() {
  return api.post(`${PHARMACY_ALERTS_BASE}/run-expiry-scan`, {});
}

// --- SETTINGS ---
export async function getPharmacySettings() {
  return api.get(PHARMACY_SETTINGS_BASE);
}

export async function updatePharmacySettings(data) {
  return api.put(PHARMACY_SETTINGS_BASE, data);
}

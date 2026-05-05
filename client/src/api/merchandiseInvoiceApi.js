import apiClient from './axiosInstance';

// ─── Invoice CRUD ─────────────────────────────────────────────────────────────

export const getAllInvoices = async () => {
  const res = await apiClient.get('/merchandise/invoices');
  return res.data; // { success, data }
};

export const getInvoiceById = async (id) => {
  const res = await apiClient.get(`/merchandise/invoices/${id}`);
  return res.data; // { success, data }
};

export const createInvoice = async (payload) => {
  // payload: { invoice_date, member_id, line_items[] }
  const res = await apiClient.post('/merchandise/invoices', payload);
  return res.data; // { success, data }
};

export const updateInvoice = async (id, payload) => {
  // payload: { invoice_date, member_id, line_items[] }
  const res = await apiClient.put(`/merchandise/invoices/${id}`, payload);
  return res.data; // { success, data }
};

export const deleteInvoice = async (id) => {
  const res = await apiClient.delete(`/merchandise/invoices/${id}`);
  return res.data; // { success, message }
};

// ─── Lookups (LOV / Auto-fill) ────────────────────────────────────────────────

export const getActiveProducts = async () => {
  const res = await apiClient.get('/merchandise/products/active');
  return res.data; // { success, data: [{ id, product_name, selling_price, stock_quantity }] }
};

export const getMemberById = async (id) => {
  const res = await apiClient.get(`/merchandise/members/${id}`);
  return res.data; // { success, data: { id, member_name } }
};
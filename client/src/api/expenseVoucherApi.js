import apiClient from './axiosInstance';

// ─── Voucher CRUD ─────────────────────────────────────────────────────────────

export const getAllVouchers = async () => {
  const res = await apiClient.get('/expenses/vouchers');
  return res.data; // { success, data }
};

export const getVoucherById = async (id) => {
  const res = await apiClient.get(`/expenses/vouchers/${id}`);
  return res.data; // { success, data }
};

export const createVoucher = async (payload) => {
  // payload: { voucher_date, vendor_name, paid_by_staff_id, method_id, line_items[] }
  const res = await apiClient.post('/expenses/vouchers', payload);
  return res.data; // { success, data }
};

export const updateVoucher = async (id, payload) => {
  const res = await apiClient.put(`/expenses/vouchers/${id}`, payload);
  return res.data; // { success, data }
};

export const deleteVoucher = async (id) => {
  const res = await apiClient.delete(`/expenses/vouchers/${id}`);
  return res.data; // { success, message }
};

// ─── Lookups ──────────────────────────────────────────────────────────────────

export const getAllExpenseCategories = async () => {
  const res = await apiClient.get('/expenses/categories');
  return res.data; // { success, data: [{ id, category_name }] }
};

export const getAllStaff = async () => {
  const res = await apiClient.get('/expenses/staff');
  return res.data; // { success, data: [{ id, staff_name, position }] }
};

export const getAllPaymentMethods = async () => {
  const res = await apiClient.get('/expenses/payment-methods');
  return res.data; // { success, data: [{ id, method_name }] }
};

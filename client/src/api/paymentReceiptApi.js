import apiClient from './axiosInstance';

export const getAllReceipts        = ()        => apiClient.get('/payment-receipts');
export const getReceiptById        = (id)      => apiClient.get(`/payment-receipts/${id}`);
export const createReceipt         = (data)    => apiClient.post('/payment-receipts', data);
export const updateReceipt         = (id, data)=> apiClient.put(`/payment-receipts/${id}`, data);
export const deleteReceipt         = (id)      => apiClient.delete(`/payment-receipts/${id}`);

export const getAllPaymentMethods   = ()        => apiClient.get('/payment-receipts/payment-methods');

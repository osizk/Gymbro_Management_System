import apiClient from './axiosInstance';

export const getAllPurchases           = ()        => apiClient.get('/equipment');
export const getPurchaseById           = (id)      => apiClient.get(`/equipment/${id}`);
export const createPurchase            = (data)    => apiClient.post('/equipment', data);
export const updatePurchase            = (id, data)=> apiClient.put(`/equipment/${id}`, data);
export const deletePurchase            = (id)      => apiClient.delete(`/equipment/${id}`);

export const getAllStaff               = ()        => apiClient.get('/equipment/staff');
export const getAllPaymentMethods      = ()        => apiClient.get('/equipment/payment-methods');
export const getAllEquipmentCategories = ()        => apiClient.get('/equipment/equipment-categories');

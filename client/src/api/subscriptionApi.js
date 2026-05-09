import apiClient from './axiosInstance';

export const getAllSubscriptions    = () => apiClient.get('/subscriptions').then(r => r.data);
export const getSubscriptionById   = (id) => apiClient.get(`/subscriptions/${id}`).then(r => r.data);
export const createSubscription    = (payload) => apiClient.post('/subscriptions', payload).then(r => r.data);
export const updateSubscription    = (id, payload) => apiClient.put(`/subscriptions/${id}`, payload).then(r => r.data);
export const deleteSubscription    = (id) => apiClient.delete(`/subscriptions/${id}`).then(r => r.data);
export const getAllPackages         = () => apiClient.get('/subscriptions/packages').then(r => r.data);
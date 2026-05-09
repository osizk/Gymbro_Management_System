import apiClient from './axiosInstance';

export const getAllBookings        = ()        => apiClient.get('/training-bookings');
export const getBookingById        = (id)      => apiClient.get(`/training-bookings/${id}`);
export const createBooking         = (data)    => apiClient.post('/training-bookings', data);
export const updateBooking         = (id, data)=> apiClient.put(`/training-bookings/${id}`, data);
export const deleteBooking         = (id)      => apiClient.delete(`/training-bookings/${id}`);

export const getAllTrainers        = ()        => apiClient.get('/training-bookings/trainers');
export const getAllTrainingTypes   = ()        => apiClient.get('/training-bookings/training-types');
export const getAllMembers         = ()        => apiClient.get('/training-bookings/members');

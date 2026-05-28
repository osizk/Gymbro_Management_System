import apiClient from './axiosInstance';

export const getReportGroups = async () => {
  const res = await apiClient.get('/reports');
  return res.data;
};

export const getReportById = async (reportId, params = {}) => {
  const res = await apiClient.get(`/reports/${reportId}`, { params });
  return res.data;
};

// src/services/api.ts
import axios from 'axios';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// User Management APIs
export const userApi = {
  // Get all pending approval requests
  getPendingApprovals: async () => {
    const response = await api.get('/admin/pending-approvals');
    return response.data;
  },

  // Approve a user
  approveUser: async (userId: string, adminId: string) => {
    const response = await api.post(`/admin/approve-user/${userId}`, {
      approvedBy: adminId,
    });
    return response.data;
  },

  // Reject a user
  rejectUser: async (userId: string, adminId: string, reason?: string) => {
    const response = await api.post(`/admin/reject-user/${userId}`, {
      rejectedBy: adminId,
      rejectionReason: reason,
    });
    return response.data;
  },

  // Get user approval status
  getUserApprovalStatus: async (userId: string) => {
    const response = await api.get(`/user/approval-status/${userId}`);
    return response.data;
  },

  // Submit user for approval (called after registration)
  submitForApproval: async (userData: {
    userId: string;
    email: string;
    displayName: string | null;
  }) => {
    const response = await api.post('/user/submit-for-approval', userData);
    return response.data;
  },

  // Send notification to admin
  notifyAdmin: async (userData: {
    userEmail: string;
    userDisplayName: string | null;
  }) => {
    const response = await api.post('/admin/notify-new-registration', userData);
    return response.data;
  },
};

export default api;
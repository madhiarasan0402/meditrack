import api from './api';

export const adminService = {
  getMetrics: async () => {
    const res = await api.get('/admin/metrics');
    return res.data;
  },

  getAllUsers: async (role = 'all') => {
    const res = await api.get('/admin/users', { params: { role } });
    return res.data;
  },

  updateUserStatus: async (id, isActive) => {
    const res = await api.put(`/admin/users/${id}/status`, { isActive });
    return res.data;
  },

  seedDatabase: async () => {
    const res = await api.post('/admin/seed-data');
    return res.data;
  }
};

import api from './api';

export const diagnosticService = {
  getAllTests: async (params = {}) => {
    const res = await api.get('/diagnostic-tests', { params });
    return res.data;
  },

  getTestById: async (id) => {
    const res = await api.get(`/diagnostic-tests/${id}`);
    return res.data;
  },

  createTest: async (testData) => {
    const res = await api.post('/diagnostic-tests', testData);
    return res.data;
  },

  updateTest: async (id, testData) => {
    const res = await api.put(`/diagnostic-tests/${id}`, testData);
    return res.data;
  },

  deleteTest: async (id) => {
    const res = await api.delete(`/diagnostic-tests/${id}`);
    return res.data;
  },

  // Test bookings
  bookTest: async (bookingData) => {
    const res = await api.post('/test-bookings', bookingData);
    return res.data;
  },

  getPatientBookings: async () => {
    const res = await api.get('/test-bookings/my');
    return res.data;
  },

  getAllBookings: async (params = {}) => {
    const res = await api.get('/test-bookings', { params });
    return res.data;
  },

  updateBookingStatus: async (id, status) => {
    const res = await api.put(`/test-bookings/${id}/status`, { status });
    return res.data;
  }
};

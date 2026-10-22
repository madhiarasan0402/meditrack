import api from './api';

export const doctorService = {
  getAllDoctors: async (params = {}) => {
    const res = await api.get('/doctors', { params });
    return res.data;
  },

  getDoctorById: async (id) => {
    const res = await api.get(`/doctors/${id}`);
    return res.data;
  },

  getDoctorSlots: async (id, date) => {
    const res = await api.get(`/doctors/${id}/slots`, { params: { date } });
    return res.data;
  },

  getDoctorAvailability: async (id) => {
    const res = await api.get(`/doctors/${id}/availability`);
    return res.data;
  },

  getMyProfile: async () => {
    const res = await api.get('/doctors/profile/me');
    return res.data;
  },

  updateProfile: async (profileData) => {
    const res = await api.put('/doctors/profile', profileData);
    return res.data;
  },

  updateSchedule: async (scheduleData) => {
    const res = await api.put('/doctors/schedule/my', scheduleData);
    return res.data;
  },

  updateStatus: async (statusData) => {
    const res = await api.put('/doctors/status', statusData);
    return res.data;
  }
};

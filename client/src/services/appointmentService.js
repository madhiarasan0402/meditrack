import api from './api';

export const appointmentService = {
  createAppointment: async (appointmentData) => {
    const res = await api.post('/appointments', appointmentData);
    return res.data;
  },

  getPatientAppointments: async () => {
    const res = await api.get('/appointments/my');
    return res.data;
  },

  getDoctorQueue: async (params = {}) => {
    // Can accept { date, filter, status }
    const res = await api.get('/appointments/doctor-queue', { params });
    return res.data;
  },

  acceptAppointment: async (id) => {
    const res = await api.put(`/appointments/${id}/accept`);
    return res.data;
  },

  rejectAppointment: async (id, reason) => {
    const res = await api.put(`/appointments/${id}/reject`, { reason });
    return res.data;
  },

  rescheduleAppointment: async (id, rescheduleData) => {
    // rescheduleData: { newDate, newTimeSlot, reason }
    const res = await api.put(`/appointments/${id}/reschedule`, rescheduleData);
    return res.data;
  },

  cancelAppointment: async (id, cancellationReason) => {
    const res = await api.put(`/appointments/${id}/cancel`, { cancellationReason });
    return res.data;
  },

  updateStatus: async (id, status) => {
    const res = await api.put(`/appointments/${id}/status`, { status });
    return res.data;
  },

  addConsultationNotes: async (id, consultationPayload) => {
    const res = await api.post(`/appointments/${id}/notes`, consultationPayload);
    return res.data;
  }
};

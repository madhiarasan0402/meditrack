import api from './api';

export const reportService = {
  uploadReport: async (formData) => {
    const res = await api.post('/reports/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data;
  },

  getPatientReports: async () => {
    const res = await api.get('/reports/my');
    return res.data;
  },

  getReportByBookingId: async (bookingId) => {
    const res = await api.get(`/reports/booking/${bookingId}`);
    return res.data;
  },

  downloadReport: async (reportId, filename = 'medical-report.pdf') => {
    const response = await api.get(`/reports/download/${reportId}`, {
      responseType: 'blob'
    });
    const blob = new Blob([response.data], { type: response.headers['content-type'] || 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
};

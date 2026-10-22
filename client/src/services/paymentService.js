import api from './api';

export const paymentService = {
  processMockCheckout: async (payload) => {
    // payload: { referenceType, referenceId, paymentMethod, simulateResult }
    const res = await api.post('/payments/mock-checkout', payload);
    return res.data;
  },

  getReceipt: async (transactionId) => {
    const res = await api.get(`/payments/receipt/${transactionId}`);
    return res.data;
  },

  getAllPayments: async () => {
    const res = await api.get('/payments');
    return res.data;
  }
};

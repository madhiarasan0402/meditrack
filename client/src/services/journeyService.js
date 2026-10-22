import api from './api';

export const journeyService = {
  getMyJourneys: async () => {
    const res = await api.get('/journeys/my');
    return res.data;
  },

  getJourneyById: async (id) => {
    const res = await api.get(`/journeys/${id}`);
    return res.data;
  },

  getActiveJourneySummary: async () => {
    const res = await api.get('/journeys/active-summary');
    return res.data;
  }
};

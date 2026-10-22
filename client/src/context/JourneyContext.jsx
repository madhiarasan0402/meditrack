import React, { createContext, useState, useEffect } from 'react';
import { journeyService } from '../services/journeyService';
import { useAuth } from '../hooks/useAuth';

export const JourneyContext = createContext(null);

export const JourneyProvider = ({ children }) => {
  const { user, isPatient } = useAuth();
  const [activeJourney, setActiveJourney] = useState(null);
  const [allJourneys, setAllJourneys] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchActiveJourney = async () => {
    if (!isPatient) return;
    try {
      setLoading(true);
      const res = await journeyService.getActiveJourneySummary();
      if (res.success) {
        setActiveJourney(res.data);
      }
    } catch (err) {
      console.warn('Could not fetch active journey:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllJourneys = async () => {
    if (!isPatient) return;
    try {
      setLoading(true);
      const res = await journeyService.getMyJourneys();
      if (res.success) {
        setAllJourneys(res.data);
      }
    } catch (err) {
      console.warn('Could not fetch all journeys:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && isPatient) {
      fetchActiveJourney();
      fetchAllJourneys();
    } else {
      setActiveJourney(null);
      setAllJourneys([]);
    }
  }, [user]);

  return (
    <JourneyContext.Provider value={{
      activeJourney,
      allJourneys,
      loading,
      refreshActiveJourney: fetchActiveJourney,
      refreshAllJourneys: fetchAllJourneys
    }}>
      {children}
    </JourneyContext.Provider>
  );
};

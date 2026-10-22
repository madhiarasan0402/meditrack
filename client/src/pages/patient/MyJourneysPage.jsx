import React, { useState, useEffect } from 'react';
import { Compass, Filter, Clock, CheckCircle2 } from 'lucide-react';
import { useJourney } from '../../hooks/useJourney';
import { JourneyCard } from '../../components/journey/JourneyCard';
import { Loader } from '../../components/common/Loader';

export const MyJourneysPage = () => {
  const { allJourneys, loading, refreshAllJourneys } = useJourney();
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    refreshAllJourneys();
  }, []);

  const filteredJourneys = allJourneys.filter((j) => {
    if (filter === 'ACTIVE') return !j.isCompleted && j.currentStage !== 'cancelled';
    if (filter === 'COMPLETED') return j.isCompleted;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-cyan-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Compass className="w-4 h-4" />
            <span>Longitudinal Healthcare Records</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            My Healthcare Journeys
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Auditable event trails tracking every stage of your clinical consultations and lab tests
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({allJourneys.length})
          </button>
          <button
            onClick={() => setFilter('ACTIVE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filter === 'ACTIVE' ? 'bg-white text-cyan-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Active ({allJourneys.filter(j => !j.isCompleted && j.currentStage !== 'cancelled').length})
          </button>
          <button
            onClick={() => setFilter('COMPLETED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filter === 'COMPLETED' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Completed ({allJourneys.filter(j => j.isCompleted).length})
          </button>
        </div>
      </div>

      {loading ? (
        <Loader message="Loading your care trails..." />
      ) : filteredJourneys.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs">
          <Compass className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No journeys in this category</h3>
          <p className="text-xs text-slate-500 mt-1">
            Book an appointment or lab test to initiate a new healthcare journey.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredJourneys.map((journey) => (
            <JourneyCard key={journey._id} journey={journey} />
          ))}
        </div>
      )}
    </div>
  );
};

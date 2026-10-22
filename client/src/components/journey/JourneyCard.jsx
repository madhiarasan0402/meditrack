import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Calendar, 
  FlaskConical, 
  Stethoscope, 
  FileText, 
  ArrowRight 
} from 'lucide-react';
import { JourneyStepper } from './JourneyStepper';
import { JourneyTimeline } from './JourneyTimeline';
import { Badge } from '../common/Badge';

export const JourneyCard = ({ journey, onActionClick, actionLabel }) => {
  const [expanded, setExpanded] = useState(false);

  const isDiagnostic = journey.journeyType === 'diagnostic_investigation';
  const latestEvent = journey.events?.[journey.events.length - 1];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden hover:border-primary-200 transition">
      {/* Header */}
      <div className="p-6 border-b border-slate-100">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isDiagnostic ? 'bg-amber-100 text-amber-700' : 'bg-primary-100 text-primary-700'
            }`}>
              {isDiagnostic ? <FlaskConical className="w-5 h-5" /> : <Stethoscope className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{journey.title}</h3>
              <p className="text-xs text-slate-500">
                Initiated on {new Date(journey.createdAt).toLocaleDateString()} &bull; ID: {journey._id.slice(-6).toUpperCase()}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Badge status={journey.currentStage} />
            {journey.isCompleted && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                Completed
              </span>
            )}
          </div>
        </div>

        {/* Stepper */}
        <JourneyStepper currentStage={journey.currentStage} />

        {/* Latest Snapshot banner */}
        {latestEvent && (
          <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-slate-700">
              <span className="font-semibold text-primary-700">Latest Event:</span>
              <span className="truncate max-w-md">{latestEvent.title} — {latestEvent.description}</span>
            </div>
            <span className="text-slate-400 font-mono">
              {new Date(latestEvent.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        )}
      </div>

      {/* Expanded Timeline Accordion */}
      {expanded && (
        <div className="p-6 bg-slate-50/50 border-b border-slate-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
            Longitudinal Audit Ledger
          </h4>
          <JourneyTimeline events={journey.events} />
        </div>
      )}

      {/* Footer controls */}
      <div className="px-6 py-3.5 bg-slate-50/80 flex items-center justify-between">
        <button
          onClick={() => setExpanded(!expanded)}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          {expanded ? (
            <>
              <span>Hide Full Event Log</span>
              <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              <span>View Audit Trail ({journey.events?.length || 0} events)</span>
              <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>

        {actionLabel && (
          <button
            onClick={() => onActionClick && onActionClick(journey)}
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-primary-600 hover:text-primary-700 transition"
          >
            <span>{actionLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

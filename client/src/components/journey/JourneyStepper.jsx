import React from 'react';
import { Check, Clock, AlertCircle } from 'lucide-react';

const STAGES = [
  { key: 'initiated', label: 'Hold Created' },
  { key: 'confirmed', label: 'Paid & Confirmed' },
  { key: 'in_progress', label: 'Clinical Action' },
  { key: 'report_ready', label: 'Report Ready' },
  { key: 'completed', label: 'Completed' }
];

export const JourneyStepper = ({ currentStage, isCancelled }) => {
  const getStageIndex = (stage) => {
    switch (stage) {
      case 'initiated':
      case 'payment_pending':
        return 0;
      case 'confirmed':
        return 1;
      case 'in_progress':
      case 'sample_collected':
      case 'processing':
        return 2;
      case 'report_ready':
        return 3;
      case 'completed':
        return 4;
      default:
        return 0;
    }
  };

  if (isCancelled || currentStage === 'cancelled') {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center space-x-3 text-rose-800 text-sm">
        <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
        <div>
          <span className="font-bold">Healthcare Journey Discontinued:</span> This booking was cancelled or declined.
        </div>
      </div>
    );
  }

  const activeIndex = getStageIndex(currentStage);

  return (
    <div className="w-full py-4">
      <div className="relative flex items-center justify-between">
        {/* Progress line background */}
        <div className="absolute left-4 right-4 top-4 h-1 bg-slate-200 -translate-y-1/2 z-0" />

        {/* Dynamic completed progress line */}
        <div
          className="absolute left-4 top-4 h-1 bg-emerald-500 transition-all duration-700 ease-in-out -translate-y-1/2 z-0"
          style={{ width: `${(activeIndex / (STAGES.length - 1)) * 92}%` }}
        />

        {STAGES.map((s, idx) => {
          const isDone = idx < activeIndex;
          const isCurrent = idx === activeIndex;

          return (
            <div key={s.key} className="flex flex-col items-center relative z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 shadow-sm ${
                  isDone
                    ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                    : isCurrent
                    ? 'bg-primary-600 text-white ring-4 ring-primary-100 shadow-primary-600/30 scale-110'
                    : 'bg-white text-slate-400 border-2 border-slate-200'
                }`}
              >
                {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : isCurrent ? <Clock className="w-4 h-4 animate-spin-slow" /> : idx + 1}
              </div>
              <span
                className={`text-[11px] mt-2 font-medium tracking-tight text-center max-w-[80px] ${
                  isCurrent
                    ? 'text-primary-700 font-bold'
                    : isDone
                    ? 'text-emerald-700'
                    : 'text-slate-400'
                }`}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

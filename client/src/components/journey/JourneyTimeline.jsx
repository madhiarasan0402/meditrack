import React from 'react';
import { 
  CheckCircle2, 
  CreditCard, 
  Calendar, 
  FileText, 
  FlaskConical, 
  UserCheck, 
  Clock, 
  Info 
} from 'lucide-react';
import { Badge } from '../common/Badge';

export const JourneyTimeline = ({ events = [] }) => {
  if (!events || events.length === 0) {
    return <p className="text-sm text-slate-500 italic">No events recorded in this journey yet.</p>;
  }

  const getEventIcon = (stage, title) => {
    const text = (stage + ' ' + title).toLowerCase();
    if (text.includes('payment')) return <CreditCard className="w-4 h-4 text-emerald-600" />;
    if (text.includes('report')) return <FileText className="w-4 h-4 text-indigo-600" />;
    if (text.includes('sample') || text.includes('lab') || text.includes('test')) return <FlaskConical className="w-4 h-4 text-amber-600" />;
    if (text.includes('doctor') || text.includes('consult')) return <UserCheck className="w-4 h-4 text-primary-600" />;
    if (text.includes('completed')) return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
    return <Clock className="w-4 h-4 text-slate-500" />;
  };

  const sortedEvents = [...events].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
      {sortedEvents.map((event, idx) => {
        const dateObj = new Date(event.timestamp);
        const formattedDate = dateObj.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
        const formattedTime = dateObj.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        });

        return (
          <div key={idx} className="relative group">
            {/* Timeline node icon */}
            <div className="absolute -left-6 top-1 w-6 h-6 rounded-full bg-white border-2 border-primary-500 flex items-center justify-center shadow-xs">
              {getEventIcon(event.stage, event.title)}
            </div>

            <div className="bg-slate-50/80 hover:bg-slate-50 transition border border-slate-200/80 rounded-xl p-4 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-bold text-slate-900">{event.title}</h4>
                  <Badge status={event.stage} />
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  {formattedDate} &bull; {formattedTime}
                </div>
              </div>

              <p className="text-sm text-slate-600 mb-2 leading-relaxed">{event.description}</p>

              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200/60 text-xs">
                <span className="text-slate-500">
                  Logged by: <span className="font-semibold text-slate-700 uppercase tracking-wider">{event.actorRole}</span>
                </span>

                {event.metadata && (
                  <div className="flex flex-wrap gap-1.5 ml-auto">
                    {Array.from(event.metadata instanceof Map ? event.metadata.entries() : Object.entries(event.metadata)).map(([k, v]) => (
                      <span key={k} className="px-2 py-0.5 rounded bg-slate-200/60 text-slate-700 font-mono text-[11px]">
                        {k}: {String(v)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

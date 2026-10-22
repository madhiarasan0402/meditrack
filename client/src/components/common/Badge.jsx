import React from 'react';

export const Badge = ({ status, text }) => {
  const getStyle = (s) => {
    switch (s?.toLowerCase()) {
      case 'confirmed':
      case 'completed':
      case 'successful':
      case 'published':
      case 'viewed':
      case 'accepted':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'scheduled':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'requested':
      case 'pending_payment':
      case 'initiated':
      case 'payment_pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'in_consultation':
      case 'in_progress':
      case 'sample_collected':
      case 'processing':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'rescheduled':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'report_ready':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-2 ring-indigo-400';
      case 'cancelled':
      case 'rejected':
      case 'failed':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const displayText = text || status?.replace(/_/g, ' ') || 'Unknown';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${getStyle(status)}`}>
      {displayText}
    </span>
  );
};

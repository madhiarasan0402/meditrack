import React from 'react';
import { Loader2 } from 'lucide-react';

export const Loader = ({ message = 'Loading MediTrack records...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-3">
      <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      <p className="text-sm font-medium text-slate-500">{message}</p>
    </div>
  );
};

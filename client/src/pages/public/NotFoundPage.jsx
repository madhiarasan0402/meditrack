import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Home } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-3xl flex items-center justify-center shadow-lg">
        <Activity className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900">404</h1>
      <p className="text-sm text-slate-500 max-w-sm">
        The healthcare portal or record URL you requested does not exist or has been relocated.
      </p>
      <Link
        to="/"
        className="inline-flex items-center space-x-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-xs shadow-xs transition"
      >
        <Home className="w-4 h-4" />
        <span>Return to Home</span>
      </Link>
    </div>
  );
};

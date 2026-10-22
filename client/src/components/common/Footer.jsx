import React from 'react';
import { Activity, ShieldCheck, HeartPulse } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center space-x-2 text-white">
              <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white">
                <Activity className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold">MediTrack</span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm">
              Integrated Digital Healthcare Platform providing seamless doctor consultations, diagnostic investigations, simulated billing, and end-to-end Healthcare Journey management.
            </p>
            <p className="text-xs text-slate-500">
              Department of Information Technology, Easwari Engineering College.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Core Modules</h4>
            <ul className="space-y-2 text-sm">
              <li>Doctor Appointment Scheduling</li>
              <li>Diagnostic Test Booking</li>
              <li>Mock Payment Gateway</li>
              <li>Digital Report Delivery</li>
              <li>Healthcare Journey Tracking</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">System Standards</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2 text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Strict RBAC Security</span>
              </div>
              <div className="flex items-center space-x-2 text-primary-400">
                <HeartPulse className="w-4 h-4" />
                <span>Longitudinal Care Trail</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Compliant with WHO Digital Health Interventions classification framework.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          &copy; {new Date().getFullYear()} MediTrack Digital Healthcare. All rights reserved. MERN Architecture.
        </div>
      </div>
    </footer>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Activity, 
  Calendar, 
  FlaskConical, 
  Compass, 
  ShieldCheck, 
  ArrowRight, 
  FileCheck2, 
  Clock, 
  CreditCard, 
  CheckCircle2, 
  HeartHandshake 
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const HomePage = () => {
  const { user, isPatient } = useAuth();

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50/70 via-white to-white py-16 px-4 sm:px-6 lg:px-8 rounded-3xl border border-primary-100 max-w-7xl mx-auto">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-primary-100/70 text-primary-800 text-xs font-bold tracking-wide uppercase">
            <Activity className="w-4 h-4 text-primary-600" />
            <span>Integrated Clinical Care Architecture</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            One Unified Platform for Your Entire <span className="text-primary-600">Healthcare Journey</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            MediTrack bridges the gap between doctor consultations, laboratory diagnostics, payment clearances, and digital medical records through an automated, real-time longitudinal journey ledger.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            {user ? (
              <Link
                to={isPatient ? "/patient/dashboard" : user.role === 'doctor' ? "/doctor/dashboard" : "/admin/dashboard"}
                className="px-6 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-lg shadow-primary-500/25 flex items-center space-x-2 transition"
              >
                <span>Go to My Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="px-6 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-lg shadow-primary-500/25 flex items-center space-x-2 transition"
                >
                  <span>Register as Patient</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/login"
                  className="px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl border border-slate-300 shadow-xs transition"
                >
                  <span>1-Click Demo Login</span>
                </Link>
              </>
            )}
            <Link
              to="/doctors"
              className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl transition"
            >
              Browse Doctors
            </Link>
          </div>
        </div>

        {/* Floating Journey Flow Visualizer */}
        <div className="mt-12 p-6 bg-white rounded-2xl border border-slate-200 shadow-xl max-w-4xl mx-auto">
          <div className="text-center mb-4">
            <span className="text-xs font-bold uppercase tracking-widest text-primary-600">
              The MediTrack Longitudinal Pipeline
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center mx-auto mb-2 text-xs font-bold">1</div>
              <p className="text-xs font-bold text-slate-800">Booking Hold</p>
              <p className="text-[10px] text-slate-500 mt-1">Doctor / Lab Slot Reserved</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2 text-xs font-bold">2</div>
              <p className="text-xs font-bold text-slate-800">Mock Payment</p>
              <p className="text-[10px] text-slate-500 mt-1">Instant Auto-Confirmation</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center mx-auto mb-2 text-xs font-bold">3</div>
              <p className="text-xs font-bold text-slate-800">Clinical Action</p>
              <p className="text-[10px] text-slate-500 mt-1">OPD Visit / Phlebotomy</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center mx-auto mb-2 text-xs font-bold">4</div>
              <p className="text-xs font-bold text-slate-800">Report Ready</p>
              <p className="text-[10px] text-slate-500 mt-1">Digital PDF Published</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 col-span-2 md:col-span-1">
              <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center mx-auto mb-2 text-xs font-bold">5</div>
              <p className="text-xs font-bold text-slate-800">Viewed & Logged</p>
              <p className="text-[10px] text-slate-500 mt-1">Prescription & Record Saved</p>
            </div>
          </div>
        </div>
      </section>

      {/* Solving the Problem of Fragmentation */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900">
            Overcoming Healthcare Disconnection
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Referencing the clinical survey findings from <span className="font-semibold text-slate-800">Digital_Healthcare_updated.pdf</span>.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-primary-300 transition">
            <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Doctor Consultations</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Real-time slot availability algorithm prevents schedule clashes. Doctors update consultation notes and write digital prescriptions in an integrated queue.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-300 transition">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
              <FlaskConical className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Diagnostic Lab Investigations</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Book hematology, biochemistry, and radiology tests with explicit preparation guides. Supports home phlebotomy collection or direct hospital lab visits.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-cyan-300 transition">
            <div className="w-12 h-12 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center mb-4">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Healthcare Journey Engine</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              The centerpiece of MediTrack. Transforms disjointed medical transactions into a single, real-time chronological event stream with auditable medical records.
            </p>
          </div>
        </div>
      </section>

      {/* Academic Defense / Architecture Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="text-xs font-bold text-primary-400 uppercase tracking-widest">
                Production-Grade MERN Architecture
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight">
                Designed for Reliability, Security, & Zero Cloud Dependencies
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                MediTrack runs completely self-contained. Diagnostic reports are stored safely on the local disk via Multer and streamed with RBAC headers. Payment transactions are simulated deterministically with realistic bank state machines.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-2 text-xs font-semibold text-slate-200">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>MongoDB + Mongoose</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Express & Node.js</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>React 18 + Tailwind CSS</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>JWT & Role-Based Access</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-primary-300">
                Pre-Loaded Demo Credentials
              </h4>
              <div className="space-y-2 text-xs font-mono">
                <div className="p-2.5 rounded bg-slate-900/90 border border-slate-700 flex justify-between items-center">
                  <div>
                    <span className="text-slate-400">Patient: </span>
                    <span className="text-emerald-400 font-bold">patient.meditrack@gmail.com</span>
                  </div>
                  <span className="text-slate-500">patient123</span>
                </div>
                <div className="p-2.5 rounded bg-slate-900/90 border border-slate-700 flex justify-between items-center">
                  <div>
                    <span className="text-slate-400">Doctor: </span>
                    <span className="text-sky-400 font-bold">doctor.sharma.meditrack@gmail.com</span>
                  </div>
                  <span className="text-slate-500">doctor123</span>
                </div>
                <div className="p-2.5 rounded bg-slate-900/90 border border-slate-700 flex justify-between items-center">
                  <div>
                    <span className="text-slate-400">Admin/Lab: </span>
                    <span className="text-amber-400 font-bold">admin.meditrack@gmail.com</span>
                  </div>
                  <span className="text-slate-500">admin123</span>
                </div>
              </div>
              <Link
                to="/login"
                className="w-full py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition"
              >
                <span>Launch Demo Credentials Login</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

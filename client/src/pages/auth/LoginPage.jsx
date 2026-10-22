import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Activity, Lock, Mail, AlertCircle, ArrowRight, UserCheck, Stethoscope, ShieldCheck, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [registrationRole, setRegistrationRole] = useState('patient');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname;

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');

    if (!/^[^\s@]+@gmail\.com$/i.test(email.trim())) {
      setError('Please use a valid Gmail address ending with @gmail.com.');
      return;
    }

    setSubmitting(true);

    try {
      const loggedUser = await login(email, password);
      // Route appropriately
      if (from) {
        navigate(from, { replace: true });
      } else if (loggedUser.role === 'doctor') {
        navigate('/doctor/dashboard');
      } else if (loggedUser.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/patient/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Authentication failed');
    } finally {
      setSubmitting(false);
    }
  };

  const fillQuickCredentials = (e, p, role) => {
    setEmail(e);
    setPassword(p);
    setRegistrationRole(role);
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-700 to-cyan-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-primary-600/30">
          <Activity className="w-7 h-7" />
        </div>
        <h2 className="mt-4 text-3xl font-extrabold text-slate-900 tracking-tight">
          Sign In to MediTrack
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Access your personalized healthcare portal and active clinical journeys
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl border border-slate-200/80 rounded-3xl sm:px-10 space-y-6">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md shadow-primary-600/20 text-sm transition flex items-center justify-center space-x-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* 1-Click Demo Buttons for Fast Evaluation */}
          <div className="pt-4 border-t border-slate-100">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center mb-3">
              Fast 1-Click Evaluation Credentials
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillQuickCredentials('patient.meditrack@gmail.com', 'patient123', 'patient')}
                className="p-2 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 flex flex-col items-center transition text-center"
              >
                <UserCheck className="w-4 h-4 text-emerald-600 mb-1" />
                <span className="text-[11px] font-bold text-slate-800">Patient</span>
                <span className="text-[9px] text-slate-400">Sarah J.</span>
              </button>

              <button
                type="button"
                onClick={() => fillQuickCredentials('doctor.sharma.meditrack@gmail.com', 'doctor123', 'doctor')}
                className="p-2 rounded-xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50/50 flex flex-col items-center transition text-center"
              >
                <Stethoscope className="w-4 h-4 text-sky-600 mb-1" />
                <span className="text-[11px] font-bold text-slate-800">Doctor</span>
                <span className="text-[9px] text-slate-400">Dr. Sharma</span>
              </button>

              <button
                type="button"
                onClick={() => fillQuickCredentials('admin.meditrack@gmail.com', 'admin123', 'patient')}
                className="p-2 rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50/50 flex flex-col items-center transition text-center"
              >
                <ShieldCheck className="w-4 h-4 text-amber-600 mb-1" />
                <span className="text-[11px] font-bold text-slate-800">Admin</span>
                <span className="text-[9px] text-slate-400">Chief Admin</span>
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-slate-500 pt-2">
            Don't have an account?{' '}
            <Link to={`/register?role=${registrationRole}`} className="font-bold text-primary-600 hover:underline">
              Create a {registrationRole === 'doctor' ? 'Doctor' : 'Patient'} Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

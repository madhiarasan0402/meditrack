import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Calendar, 
  FlaskConical, 
  DollarSign, 
  Clock, 
  Compass, 
  RefreshCw,
  TrendingUp,
  FileCheck,
  AlertCircle
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { paymentService } from '../../services/paymentService';
import { Loader } from '../../components/common/Loader';
import { Badge } from '../../components/common/Badge';

export const AdminDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedNotice, setSeedNotice] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [mRes, pRes] = await Promise.all([
        adminService.getMetrics(),
        paymentService.getAllPayments()
      ]);

      if (mRes.success) setMetrics(mRes.data);
      if (pRes.success) setPayments(pRes.data);
    } catch (err) {
      console.error('Error loading admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedDatabase = async () => {
    if (!window.confirm('Reset and re-seed database with default evaluation demo records?')) return;
    try {
      setSeeding(true);
      setSeedNotice('');
      const res = await adminService.seedDatabase();
      if (res.success) {
        setSeedNotice('Database seeded successfully with clean demo records!');
        await loadDashboardData();
      }
    } catch (err) {
      alert('Seed failed: ' + err.message);
    } finally {
      setSeeding(false);
    }
  };

  if (loading) {
    return <Loader message="Aggregating platform health and clinical metrics..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-amber-700 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Platform Governance & Laboratory Operations</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Administrator Command Center
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time platform metrics, clinical transaction audit trails, and laboratory orchestration
          </p>
        </div>

        {/* Database Reset / Re-seed Button */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleSeedDatabase}
            disabled={seeding}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-xs transition flex items-center space-x-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${seeding ? 'animate-spin' : ''}`} />
            <span>{seeding ? 'Resetting DB...' : 'Reset & Re-Seed Demo Records'}</span>
          </button>
        </div>
      </div>

      {seedNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center space-x-2">
          <FileCheck className="w-4 h-4 text-emerald-600" />
          <span>{seedNotice}</span>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Patients</span>
            <Users className="w-5 h-5 text-primary-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{metrics?.totalPatients || 0}</p>
          <span className="text-[11px] text-emerald-600 font-semibold block mt-1">Verified user records</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Doctors</span>
            <Calendar className="w-5 h-5 text-sky-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{metrics?.totalDoctors || 0}</p>
          <span className="text-[11px] text-sky-600 font-semibold block mt-1">Consulting on platform</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Lab In-Progress</span>
            <FlaskConical className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{metrics?.pendingReportsCount || 0}</p>
          <span className="text-[11px] text-amber-600 font-semibold block mt-1">Specimens in analysis</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Gross Clearance (INR)</span>
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-700">₹{metrics?.totalRevenue?.toLocaleString() || 0}</p>
          <span className="text-[11px] text-emerald-600 font-semibold block mt-1">Mock gateway receipts</span>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 block">Total Appointments Handled</span>
            <span className="text-xl font-bold text-slate-900">{metrics?.totalAppointments || 0}</span>
          </div>
          <Calendar className="w-6 h-6 text-slate-400" />
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 block">Diagnostic Tests Ordered</span>
            <span className="text-xl font-bold text-slate-900">{metrics?.totalTestBookings || 0}</span>
          </div>
          <FlaskConical className="w-6 h-6 text-slate-400" />
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 block">Active Healthcare Journeys</span>
            <span className="text-xl font-bold text-cyan-700">{metrics?.activeJourneysCount || 0}</span>
          </div>
          <Compass className="w-6 h-6 text-cyan-600" />
        </div>
      </div>

      {/* Financial Audit Trail */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">Recent Payment Ledger (Mock Transactions)</h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {payments.length} transactions recorded
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-4 px-6">Transaction ID</th>
                <th className="py-4 px-6">Patient</th>
                <th className="py-4 px-6">Service Category</th>
                <th className="py-4 px-6">Method</th>
                <th className="py-4 px-6">Amount</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-mono text-[11px]">
              {payments.slice(0, 8).map((pay) => (
                <tr key={pay._id} className="hover:bg-slate-50/80 transition font-sans">
                  <td className="py-4 px-6 font-mono font-bold text-slate-900">{pay.transactionId}</td>
                  <td className="py-4 px-6 font-semibold text-slate-800">{pay.patientId?.name || 'Patient'}</td>
                  <td className="py-4 px-6 capitalize">{pay.referenceType}</td>
                  <td className="py-4 px-6 font-mono uppercase text-[10px] text-slate-600">{pay.paymentMethod}</td>
                  <td className="py-4 px-6 font-bold text-emerald-700">₹{pay.amount}</td>
                  <td className="py-4 px-6">
                    <Badge status={pay.paymentStatus} />
                  </td>
                  <td className="py-4 px-6 text-right text-slate-500 text-[11px]">
                    {new Date(pay.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

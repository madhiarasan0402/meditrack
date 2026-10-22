import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FlaskConical, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Home, 
  Building2, 
  UploadCloud,
  Filter 
} from 'lucide-react';
import { diagnosticService } from '../../services/diagnosticService';
import { Badge } from '../../components/common/Badge';
import { Loader } from '../../components/common/Loader';

export const ManageBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const res = await diagnosticService.getAllBookings();
      if (res.success) {
        setBookings(res.data);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      await diagnosticService.updateBookingStatus(bookingId, newStatus);
      await loadBookings();
    } catch (err) {
      alert('Status update failed: ' + err.message);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (statusFilter === 'ALL') return true;
    return b.status === statusFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-amber-700 text-xs font-bold uppercase tracking-wider mb-1">
            <FlaskConical className="w-4 h-4" />
            <span>Laboratory Specimen Tracking</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Diagnostic Bookings Workflow
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Update biological specimen collection states and dispatch test results to patient portals
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold overflow-x-auto">
          {['ALL', 'confirmed', 'sample_collected', 'processing', 'completed'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg capitalize whitespace-nowrap transition ${
                statusFilter === st ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Loader message="Loading laboratory dispatch records..." />
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs">
          <FlaskConical className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No test bookings in this stage</h3>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Booking Ref</th>
                  <th className="py-4 px-6">Patient</th>
                  <th className="py-4 px-6">Test Name</th>
                  <th className="py-4 px-6">Collection Mode</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Workflow Transition</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredBookings.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-50/80 transition">
                    <td className="py-4 px-6 font-mono font-bold text-slate-900">
                      #{b._id.slice(-6).toUpperCase()}
                      <div className="text-[10px] text-slate-400 font-sans mt-0.5">
                        {new Date(b.bookingDate).toLocaleDateString()} &bull; {b.timeSlot}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900">{b.patientId?.name}</div>
                      <div className="text-[11px] text-slate-500">{b.patientId?.phone || b.patientId?.email}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-800">{b.testId?.testName}</div>
                      <span className="text-[10px] font-mono text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                        {b.testId?.testCode}
                      </span>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      {b.collectionType === 'home_collection' ? (
                        <div className="flex items-center space-x-1 text-emerald-700">
                          <Home className="w-3.5 h-3.5" />
                          <span className="font-semibold">Home Phlebotomy</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1 text-slate-600">
                          <Building2 className="w-3.5 h-3.5" />
                          <span>Lab Visit</span>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <Badge status={b.status} />
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap space-x-2">
                      {b.status === 'confirmed' && (
                        <button
                          onClick={() => handleUpdateStatus(b._id, 'sample_collected')}
                          className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs shadow-xs transition"
                        >
                          Mark Sample Collected
                        </button>
                      )}

                      {b.status === 'sample_collected' && (
                        <button
                          onClick={() => handleUpdateStatus(b._id, 'processing')}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-xs transition"
                        >
                          Send to Analyzer
                        </button>
                      )}

                      {b.status === 'processing' && (
                        <Link
                          to={`/admin/upload-report?bookingId=${b._id}`}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-xs transition"
                        >
                          <UploadCloud className="w-3.5 h-3.5" />
                          <span>Upload PDF Report</span>
                        </Link>
                      )}

                      {b.status === 'completed' && (
                        <span className="text-emerald-700 font-bold text-xs inline-flex items-center space-x-1">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Report Delivered</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

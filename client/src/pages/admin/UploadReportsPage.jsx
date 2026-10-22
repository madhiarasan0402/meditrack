import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { diagnosticService } from '../../services/diagnosticService';
import { reportService } from '../../services/reportService';
import { Loader } from '../../components/common/Loader';

export const UploadReportsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const presetBookingId = searchParams.get('bookingId');

  const [bookings, setBookings] = useState([]);
  const [selectedBookingId, setSelectedBookingId] = useState(presetBookingId || '');
  const [file, setFile] = useState(null);
  const [clinicalRemarks, setClinicalRemarks] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadEligibleBookings();
  }, []);

  const loadEligibleBookings = async () => {
    try {
      setLoading(true);
      const res = await diagnosticService.getAllBookings();
      if (res.success) {
        // Show bookings eligible for report upload (not already completed)
        setBookings(res.data.filter(b => b.status !== 'completed' && b.status !== 'cancelled'));
        if (presetBookingId) {
          setSelectedBookingId(presetBookingId);
        }
      }
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBookingId) {
      setError('Please select a target test booking');
      return;
    }
    if (!file) {
      setError('Please select a PDF diagnostic report document to upload');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('testBookingId', selectedBookingId);
      formData.append('reportFile', file);
      formData.append('clinicalRemarks', clinicalRemarks || 'Diagnostic evaluation completed. Report verified by laboratory.');

      const res = await reportService.uploadReport(formData);
      if (res.success) {
        setSuccess(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Report upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <Loader message="Fetching pending diagnostic test orders..." />;
  }

  const selectedBooking = bookings.find(b => b._id === selectedBookingId);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <div className="flex items-center space-x-2 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-1">
          <UploadCloud className="w-4 h-4" />
          <span>Laboratory Information System &bull; Report Dispatch</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Publish Digital Diagnostic Report
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Upload certified laboratory findings to automatically transition the patient's Healthcare Journey to <strong className="text-indigo-700">Report Ready</strong>
        </p>
      </div>

      {success ? (
        <div className="bg-white p-8 rounded-3xl border border-emerald-200 shadow-md text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900">Report Uploaded & Published!</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              The diagnostic report is now available in the patient's portal, and their Healthcare Journey has advanced to <span className="font-bold text-emerald-700">Report Ready</span>.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-mono max-w-md mx-auto text-left space-y-1">
            <div><span className="text-slate-400">Test:</span> {success.testName}</div>
            <div><span className="text-slate-400">File:</span> {success.originalFileName}</div>
            <div><span className="text-slate-400">Remarks:</span> {success.clinicalRemarks}</div>
          </div>

          <div className="flex justify-center space-x-3 pt-2">
            <button
              onClick={() => {
                setSuccess(null);
                setFile(null);
                setClinicalRemarks('');
                loadEligibleBookings();
              }}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
            >
              Upload Another Report
            </button>
            <button
              onClick={() => navigate('/admin/bookings')}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-xs transition"
            >
              Back to Bookings
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Select Target Test Booking */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Select Patient Diagnostic Booking
            </label>
            {bookings.length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-500 border border-slate-200 text-center">
                No active bookings currently awaiting diagnostic reports.
              </div>
            ) : (
              <select
                required
                value={selectedBookingId}
                onChange={(e) => setSelectedBookingId(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                <option value="">-- Choose Target Test Booking --</option>
                {bookings.map((b) => (
                  <option key={b._id} value={b._id}>
                    #{b._id.slice(-6).toUpperCase()} — {b.patientId?.name} — {b.testId?.testName} ({b.status})
                  </option>
                ))}
              </select>
            )}
          </div>

          {selectedBooking && (
            <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl text-xs space-y-1">
              <span className="font-bold text-indigo-900 block">Selected Order Details:</span>
              <p className="text-slate-700">Patient: <strong className="text-slate-900">{selectedBooking.patientId?.name}</strong> ({selectedBooking.patientId?.phone})</p>
              <p className="text-slate-700">Test: <strong className="text-slate-900">{selectedBooking.testId?.testName}</strong> [{selectedBooking.testId?.testCode}]</p>
              <p className="text-slate-700">Specimen Mode: <span className="capitalize">{selectedBooking.collectionType.replace('_', ' ')}</span></p>
            </div>
          )}

          {/* File Upload Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Attach PDF / Certified Document (Max: 10MB)
            </label>
            <div className="border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-2xl p-6 text-center cursor-pointer bg-slate-50/50 hover:bg-indigo-50/20 transition relative">
              <input
                type="file"
                required
                accept=".pdf,image/png,image/jpeg"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <UploadCloud className="w-10 h-10 text-indigo-500 mx-auto mb-2" />
              {file ? (
                <div className="text-xs">
                  <span className="font-bold text-indigo-700">{file.name}</span>
                  <span className="text-slate-400 block mt-0.5">({(file.size / 1024).toFixed(1)} KB)</span>
                </div>
              ) : (
                <div className="text-xs text-slate-500">
                  <span className="font-bold text-slate-700">Click to upload report</span> or drag and drop
                  <span className="block text-[11px] text-slate-400 mt-1">PDF, JPG, PNG formats permitted</span>
                </div>
              )}
            </div>
          </div>

          {/* Clinical Remarks */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Pathologist Remarks & Clinical Notes
            </label>
            <textarea
              rows={3}
              value={clinicalRemarks}
              onChange={(e) => setClinicalRemarks(e.target.value)}
              placeholder="e.g. Normal lipid parameters observed. Total cholesterol within desirable threshold (<200 mg/dL)..."
              className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={uploading || !selectedBookingId || !file}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center justify-center space-x-2"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Uploading to Multer Storage & Advancing Journey...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                <span>Publish Report to Patient Portal</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
};

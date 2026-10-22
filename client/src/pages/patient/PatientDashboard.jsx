import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Activity, 
  Calendar, 
  FlaskConical, 
  FileText, 
  Compass, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  CreditCard,
  FileCheck2,
  Stethoscope,
  Pencil,
  XCircle
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useJourney } from '../../hooks/useJourney';
import { appointmentService } from '../../services/appointmentService';
import { doctorService } from '../../services/doctorService';
import { diagnosticService } from '../../services/diagnosticService';
import { reportService } from '../../services/reportService';
import { JourneyStepper } from '../../components/journey/JourneyStepper';
import { JourneyTimeline } from '../../components/journey/JourneyTimeline';
import { Badge } from '../../components/common/Badge';
import { Loader } from '../../components/common/Loader';
import { MockPaymentModal } from '../../components/payment/MockPaymentModal';
import { Modal } from '../../components/common/Modal';

const formatDateForInput = (value) => new Date(value).toISOString().split('T')[0];

export const PatientDashboard = () => {
  const { user } = useAuth();
  const { activeJourney, refreshActiveJourney, refreshAllJourneys } = useJourney();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [testBookings, setTestBookings] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Unpaid item retry payment modal state
  const [paymentModalData, setPaymentModalData] = useState(null);
  const [rescheduleModalAppt, setRescheduleModalAppt] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleSlot, setRescheduleSlot] = useState('');
  const [availableRescheduleSlots, setAvailableRescheduleSlots] = useState([]);
  const [loadingRescheduleSlots, setLoadingRescheduleSlots] = useState(false);
  const [rescheduleReason, setRescheduleReason] = useState('Patient schedule conflict');
  const [cancelModalAppt, setCancelModalAppt] = useState(null);
  const [cancellationReason, setCancellationReason] = useState('Patient schedule conflict');
  const [appointmentActionLoading, setAppointmentActionLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [apptsRes, testsRes, reportsRes] = await Promise.all([
        appointmentService.getPatientAppointments(),
        diagnosticService.getPatientBookings(),
        reportService.getPatientReports()
      ]);

      if (apptsRes.success) setAppointments(apptsRes.data);
      if (testsRes.success) setTestBookings(testsRes.data);
      if (reportsRes.success) setReports(reportsRes.data);
    } catch (err) {
      console.error('Error loading patient dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePayPending = (item, type) => {
    setPaymentModalData({
      referenceType: type,
      referenceId: item._id,
      title: type === 'Appointment' ? `Doctor Consultation` : `Diagnostic Lab Test`,
      amount: item.fee || item.amount
    });
  };

  const loadRescheduleSlots = async (date, doctorId) => {
    if (!date || !doctorId) return;
    try {
      setLoadingRescheduleSlots(true);
      const res = await doctorService.getDoctorSlots(doctorId, date);
      setAvailableRescheduleSlots(res.success ? res.data.filter(slot => slot.isAvailable) : []);
    } catch (err) {
      setAvailableRescheduleSlots([]);
    } finally {
      setLoadingRescheduleSlots(false);
    }
  };

  const handleOpenReschedule = async (appt) => {
    const date = formatDateForInput(appt.appointmentDate);
    setRescheduleModalAppt(appt);
    setRescheduleDate(date);
    setRescheduleSlot('');
    await loadRescheduleSlots(date, appt.doctorId?._id);
  };

  const handleConfirmReschedule = async (event) => {
    event.preventDefault();
    if (!rescheduleModalAppt || !rescheduleSlot) return;

    try {
      setAppointmentActionLoading(true);
      const res = await appointmentService.rescheduleAppointment(rescheduleModalAppt._id, {
        newDate: rescheduleDate,
        newTimeSlot: rescheduleSlot,
        reason: rescheduleReason
      });
      if (res.success) {
        setRescheduleModalAppt(null);
        await loadDashboardData();
        await refreshActiveJourney();
        await refreshAllJourneys();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to reschedule this appointment.');
    } finally {
      setAppointmentActionLoading(false);
    }
  };

  const handleConfirmCancellation = async (event) => {
    event.preventDefault();
    if (!cancelModalAppt) return;

    try {
      setAppointmentActionLoading(true);
      const res = await appointmentService.cancelAppointment(cancelModalAppt._id, cancellationReason);
      if (res.success) {
        setCancelModalAppt(null);
        await loadDashboardData();
        await refreshActiveJourney();
        await refreshAllJourneys();
        alert(res.message);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to cancel this appointment.');
    } finally {
      setAppointmentActionLoading(false);
    }
  };

  const handleDownload = async (reportId, filename) => {
    try {
      await reportService.downloadReport(reportId, filename);
      loadDashboardData();
      refreshActiveJourney();
    } catch (err) {
      alert('Could not download report: ' + err.message);
    }
  };

  if (loading) {
    return <Loader message="Compiling your healthcare journey and medical records..." />;
  }

  const upcomingAppts = appointments.filter(a => a.status !== 'cancelled' && a.status !== 'completed');
  const activeTests = testBookings.filter(t => t.status !== 'cancelled' && t.status !== 'completed');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary-700 via-primary-600 to-cyan-600 text-white p-6 sm:p-8 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-primary-200 text-xs font-bold uppercase tracking-wider mb-1">
              <Activity className="w-4 h-4" />
              <span>Patient Healthcare Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name}
            </h1>
            <p className="text-xs sm:text-sm text-primary-100 mt-1 max-w-xl">
              Blood Group: <span className="font-bold text-white">{user?.bloodGroup || 'B+'}</span> &bull; Address: {user?.address?.city || 'Chennai'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              to="/doctors"
              className="px-4 py-2.5 bg-white text-primary-700 hover:bg-primary-50 rounded-xl font-bold text-xs shadow-xs transition flex items-center space-x-1.5"
            >
              <Stethoscope className="w-4 h-4" />
              <span>Book Doctor</span>
            </Link>
            <Link
              to="/diagnostics"
              className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-white rounded-xl font-bold text-xs shadow-xs transition flex items-center space-x-1.5"
            >
              <FlaskConical className="w-4 h-4" />
              <span>Order Lab Test</span>
            </Link>
          </div>
        </div>
      </div>

      {/* CENTERPIECE: Active Healthcare Journey Banner */}
      {activeJourney ? (
        <div className="bg-white rounded-3xl border-2 border-primary-500/30 p-6 sm:p-8 shadow-md relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold">
                <Compass className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-700">
                  Active Clinical Journey
                </span>
                <h3 className="text-lg font-bold text-slate-900">{activeJourney.title}</h3>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Badge status={activeJourney.currentStage} />
              <Link
                to="/patient/journeys"
                className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center space-x-1"
              >
                <span>Full Audit Trail</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Longitudinal Stepper */}
          <div className="my-2">
            <JourneyStepper currentStage={activeJourney.currentStage} />
          </div>

          {/* Latest Event Banner */}
          {activeJourney.events && activeJourney.events.length > 0 && (
            <div className="mt-4 p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center space-x-2 text-slate-700">
                <span className="font-bold text-primary-700 uppercase tracking-wide">Current Status:</span>
                <span className="font-medium text-slate-900">
                  {activeJourney.events[activeJourney.events.length - 1].title} — {activeJourney.events[activeJourney.events.length - 1].description}
                </span>
              </div>
              <span className="text-slate-400 font-mono text-[11px]">
                Updated {new Date(activeJourney.events[activeJourney.events.length - 1].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-slate-50 border border-dashed border-slate-300 rounded-3xl p-6 text-center">
          <Compass className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-700">No Active Healthcare Journey</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Book a doctor consultation or diagnostic test to initialize your real-time longitudinal journey tracker.
          </p>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Upcoming Appts</span>
            <Calendar className="w-5 h-5 text-primary-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{upcomingAppts.length}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Scheduled OPD visits</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pending Lab Tests</span>
            <FlaskConical className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{activeTests.length}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Awaiting sample / report</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Digital Reports</span>
            <FileText className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{reports.length}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Available for download</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Records</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">
            {appointments.length + testBookings.length}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Lifetime care episodes</span>
        </div>
      </div>

      {/* Main Two Columns: Upcoming Appointments & Recent Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Appointments Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-primary-600" />
              <h3 className="text-base font-bold text-slate-900">Your Appointments</h3>
            </div>
            <Link to="/doctors" className="text-xs font-bold text-primary-600 hover:text-primary-700">
              + New Appointment
            </Link>
          </div>

          {appointments.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center italic">No appointment history yet.</p>
          ) : (
            <div className="space-y-3">
              {appointments.slice(0, 3).map((appt) => (
                <div key={appt._id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col justify-between space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {appt.doctorId?.userId?.name || 'Doctor Consultation'}
                      </h4>
                      <p className="text-xs text-primary-700 font-semibold">{appt.doctorId?.specialization} &bull; Room {appt.doctorId?.roomNumber}</p>
                    </div>
                    <Badge status={appt.status} />
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <span>{new Date(appt.appointmentDate).toDateString()} &bull; {appt.timeSlot}</span>
                    <span className="font-bold text-slate-800">Fee: ₹{appt.fee}</span>
                  </div>

                  {appt.consultationNotes && (
                    <div className="mt-1 p-2 bg-white rounded-lg border border-slate-200 text-xs text-slate-700">
                      <strong>Rx Notes:</strong> {appt.consultationNotes}
                    </div>
                  )}

                  {appt.status === 'pending_payment' && (
                    <button
                      onClick={() => handlePayPending(appt, 'Appointment')}
                      className="mt-2 w-full py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs shadow-xs transition"
                    >
                      Complete Payment (₹{appt.fee})
                    </button>
                  )}

                  {['requested', 'accepted', 'scheduled', 'confirmed', 'rescheduled', 'pending_payment'].includes(appt.status) && (
                    <div className="flex gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => handleOpenReschedule(appt)}
                        className="flex-1 py-1.5 bg-white hover:bg-sky-50 text-sky-700 border border-sky-200 font-bold rounded-lg text-xs transition flex items-center justify-center gap-1"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit Slot
                      </button>
                      <button
                        type="button"
                        onClick={() => setCancelModalAppt(appt)}
                        className="flex-1 py-1.5 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 font-bold rounded-lg text-xs transition flex items-center justify-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Diagnostic Reports Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">Diagnostic Reports</h3>
            </div>
            <Link to="/patient/reports" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">
              View All ({reports.length})
            </Link>
          </div>

          {reports.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-xs text-slate-500 italic">No diagnostic reports published yet.</p>
              <Link to="/diagnostics" className="mt-2 inline-block text-xs font-bold text-amber-700 hover:underline">
                Order a diagnostic test
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.slice(0, 3).map((rep) => (
                <div key={rep._id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900">{rep.testName}</h4>
                    <p className="text-xs text-slate-500">
                      Uploaded on {new Date(rep.createdAt).toLocaleDateString()} &bull; {rep.originalFileName}
                    </p>
                    <Badge status={rep.status} />
                  </div>
                  <button
                    onClick={() => handleDownload(rep._id, rep.originalFileName)}
                    className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-xs transition flex items-center space-x-1"
                  >
                    <span>Download PDF</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mock Payment Modal */}
      {paymentModalData && (
        <MockPaymentModal
          isOpen={!!paymentModalData}
          bookingDetails={paymentModalData}
          onClose={() => setPaymentModalData(null)}
          onPaymentSuccess={() => {
            loadDashboardData();
            refreshActiveJourney();
            refreshAllJourneys();
          }}
        />
      )}

      <Modal
        isOpen={!!rescheduleModalAppt}
        onClose={() => setRescheduleModalAppt(null)}
        title="Change Appointment Slot"
      >
        <form onSubmit={handleConfirmReschedule} className="space-y-4">
          <p className="text-xs text-slate-500">
            Choose a date and an available slot for {rescheduleModalAppt?.doctorId?.userId?.name || 'your doctor'}.
          </p>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">New Date</label>
            <input
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={rescheduleDate}
              onChange={async (event) => {
                setRescheduleDate(event.target.value);
                setRescheduleSlot('');
                await loadRescheduleSlots(event.target.value, rescheduleModalAppt?.doctorId?._id);
              }}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Available Time Slot</label>
            {loadingRescheduleSlots ? (
              <p className="text-xs text-slate-500 py-3">Checking available slots...</p>
            ) : availableRescheduleSlots.length === 0 ? (
              <p className="text-xs text-slate-500 py-3">No available slots on this date.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {availableRescheduleSlots.map((slot) => (
                  <button
                    type="button"
                    key={slot.slot}
                    onClick={() => setRescheduleSlot(slot.slot)}
                    className={`p-2 rounded-xl text-xs font-bold border transition ${rescheduleSlot === slot.slot ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
                  >
                    {slot.slot}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Reason</label>
            <input
              value={rescheduleReason}
              onChange={(event) => setRescheduleReason(event.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={appointmentActionLoading || !rescheduleSlot}
            className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs"
          >
            {appointmentActionLoading ? 'Updating...' : 'Confirm New Slot'}
          </button>
        </form>
      </Modal>

      <Modal
        isOpen={!!cancelModalAppt}
        onClose={() => setCancelModalAppt(null)}
        title="Cancel Appointment"
      >
        <form onSubmit={handleConfirmCancellation} className="space-y-4">
          <p className="text-sm text-slate-600">
            Cancelling a paid appointment will mark the mock payment as refunded. The refund is scheduled to reach your account within 24 hours.
          </p>
          <textarea
            rows={3}
            value={cancellationReason}
            onChange={(event) => setCancellationReason(event.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            placeholder="Reason for cancellation"
          />
          <button
            type="submit"
            disabled={appointmentActionLoading}
            className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs"
          >
            {appointmentActionLoading ? 'Cancelling...' : 'Confirm Cancellation'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

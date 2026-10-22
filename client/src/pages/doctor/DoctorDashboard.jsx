import React, { useState, useEffect } from 'react';
import { 
  Stethoscope, 
  Users, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  XCircle,
  Plus, 
  Trash2, 
  FileText,
  Loader2,
  Phone,
  Building,
  DollarSign,
  FileBadge,
  Save,
  Check,
  RefreshCw,
  Bell,
  Sliders,
  User,
  MapPin,
  CalendarClock,
  Ban,
  ArrowRight
} from 'lucide-react';
import { appointmentService } from '../../services/appointmentService';
import { doctorService } from '../../services/doctorService';
import { diagnosticService } from '../../services/diagnosticService';
import { notificationService } from '../../services/notificationService';
import { useAuth } from '../../hooks/useAuth';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Loader } from '../../components/common/Loader';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const DoctorDashboard = () => {
  const { user, doctor, updateDoctor } = useAuth();

  const [activeTab, setActiveTab] = useState('today'); // 'today', 'all', 'availability', 'profile', 'notifications'
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [appointmentFilter, setAppointmentFilter] = useState('ALL');

  // Doctor Profile and Schedule State
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [availabilityStatus, setAvailabilityStatus] = useState('available');
  const [scheduleData, setScheduleData] = useState({
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    workingHours: { start: '09:00', end: '17:00' },
    breakTime: { start: '13:00', end: '14:00' },
    slotDurationMinutes: 30,
    consultationFee: 600,
    roomNumber: 'OPD-101'
  });

  // Busy Time Window State
  const [busyDate, setBusyDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [busyStart, setBusyStart] = useState('10:00');
  const [busyEnd, setBusyEnd] = useState('13:00');
  const [busyReason, setBusyReason] = useState('In emergency surgery / Hospital rounds');

  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);

  // Modals State
  const [rejectModalAppt, setRejectModalAppt] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const [rescheduleModalAppt, setRescheduleModalAppt] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [rescheduleSlot, setRescheduleSlot] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [availableRescheduleSlots, setAvailableRescheduleSlots] = useState([]);
  const [loadingRescheduleSlots, setLoadingRescheduleSlots] = useState(false);

  const [cancelModalAppt, setCancelModalAppt] = useState(null);
  const [cancellationReason, setCancellationReason] = useState('');

  const [viewRxAppt, setViewRxAppt] = useState(null);

  // Consultation Modal State
  const [activeConsultation, setActiveConsultation] = useState(null);
  const [consultationNotes, setConsultationNotes] = useState('');
  const [prescriptions, setPrescriptions] = useState([
    { medicineName: '', dosage: '', frequency: '1-0-1', duration: '5 days' }
  ]);
  const [availableTests, setAvailableTests] = useState([]);
  const [selectedTests, setSelectedTests] = useState([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadAppointments(),
        loadDoctorProfile(),
        loadDiagnosticTests(),
        loadNotifications()
      ]);
    } catch (err) {
      console.error('Error loading doctor workspace:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAppointments = async () => {
    try {
      const res = await appointmentService.getDoctorQueue();
      if (res.success) {
        setAppointments(res.data);
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
    }
  };

  const loadDoctorProfile = async () => {
    try {
      const res = await doctorService.getMyProfile();
      if (res.success && res.data) {
        setDoctorProfile(res.data);
        updateDoctor(res.data);
        setAvailabilityStatus(res.data.availabilityStatus || 'available');
        setScheduleData({
          availableDays: res.data.availableDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          workingHours: res.data.workingHours || { start: '09:00', end: '17:00' },
          breakTime: res.data.breakTime || { start: '13:00', end: '14:00' },
          slotDurationMinutes: res.data.slotDurationMinutes || 30,
          consultationFee: res.data.consultationFee || 600,
          roomNumber: res.data.roomNumber || 'OPD-101'
        });
      }
    } catch (err) {
      console.warn('Could not fetch doctor profile:', err);
    }
  };

  const loadDiagnosticTests = async () => {
    try {
      const res = await diagnosticService.getAllTests();
      if (res.success) {
        setAvailableTests(res.data);
      }
    } catch (err) {
      console.warn('Could not load test catalog:', err);
    }
  };

  const loadNotifications = async () => {
    try {
      const res = await notificationService.getMyNotifications();
      if (res.success) {
        setNotifications(res.data);
        setUnreadNotifCount(res.unreadCount || 0);
      }
    } catch (err) {
      console.warn('Could not fetch notifications:', err);
    }
  };

  // Availability & Status Handlers
  const handleQuickStatusChange = async (newStatus) => {
    try {
      setActionLoading(true);
      const res = await doctorService.updateStatus({ availabilityStatus: newStatus });
      if (res.success) {
        setAvailabilityStatus(newStatus);
        setDoctorProfile(prev => ({ ...prev, availabilityStatus: newStatus }));
        alert(`Status updated to: ${newStatus.toUpperCase()}`);
      }
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddBusyInterval = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const res = await doctorService.updateStatus({
        availabilityStatus: 'busy',
        busyInterval: {
          date: busyDate,
          startTime: busyStart,
          endTime: busyEnd,
          reason: busyReason
        }
      });
      if (res.success) {
        setAvailabilityStatus('busy');
        await loadDoctorProfile();
        alert(`Busy time interval added: ${busyDate} from ${busyStart} to ${busyEnd}. Patients cannot book this slot.`);
      }
    } catch (err) {
      alert('Error setting busy interval: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleClearBusyIntervals = async () => {
    try {
      setActionLoading(true);
      await doctorService.updateStatus({
        availabilityStatus: 'available',
        clearBusyIntervals: true
      });
      setAvailabilityStatus('available');
      await loadDoctorProfile();
      alert('Busy intervals cleared. Doctor status restored to Available.');
    } catch (err) {
      alert('Error clearing intervals: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const res = await doctorService.updateSchedule({
        ...scheduleData,
        availabilityStatus
      });
      if (res.success) {
        alert('Consultation schedule preferences saved successfully.');
        await loadDoctorProfile();
      }
    } catch (err) {
      alert('Failed to save schedule: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const toggleScheduleDay = (day) => {
    const current = scheduleData.availableDays;
    if (current.includes(day)) {
      if (current.length === 1) {
        alert('Please keep at least one available day.');
        return;
      }
      setScheduleData({ ...scheduleData, availableDays: current.filter(d => d !== day) });
    } else {
      setScheduleData({ ...scheduleData, availableDays: [...current, day] });
    }
  };

  // Appointment Actions
  const handleAcceptAppointment = async (apptId) => {
    try {
      setActionLoading(true);
      const res = await appointmentService.acceptAppointment(apptId);
      if (res.success) {
        await loadAppointments();
        await loadNotifications();
      }
    } catch (err) {
      alert('Failed to accept appointment: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenReject = (appt) => {
    setRejectModalAppt(appt);
    setRejectionReason('Doctor unavailable during requested schedule.');
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectModalAppt) return;
    try {
      setActionLoading(true);
      const res = await appointmentService.rejectAppointment(rejectModalAppt._id, rejectionReason);
      if (res.success) {
        setRejectModalAppt(null);
        await loadAppointments();
        await loadNotifications();
      }
    } catch (err) {
      alert('Failed to reject: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenReschedule = async (appt) => {
    setRescheduleModalAppt(appt);
    setRescheduleReason('Doctor request for schedule adjustment.');
    setRescheduleSlot('');
    await fetchRescheduleSlots(rescheduleDate);
  };

  const fetchRescheduleSlots = async (date) => {
    if (!doctorProfile?._id) return;
    try {
      setLoadingRescheduleSlots(true);
      const res = await doctorService.getDoctorSlots(doctorProfile._id, date);
      if (res.success) {
        setAvailableRescheduleSlots(res.data.filter(s => s.isAvailable));
      }
    } catch (err) {
      console.warn('Failed to load slots:', err);
    } finally {
      setLoadingRescheduleSlots(false);
    }
  };

  const handleConfirmReschedule = async (e) => {
    e.preventDefault();
    if (!rescheduleSlot) {
      alert('Please select an available time slot.');
      return;
    }
    try {
      setActionLoading(true);
      const res = await appointmentService.rescheduleAppointment(rescheduleModalAppt._id, {
        newDate: rescheduleDate,
        newTimeSlot: rescheduleSlot,
        reason: rescheduleReason
      });
      if (res.success) {
        setRescheduleModalAppt(null);
        await loadAppointments();
        await loadNotifications();
        alert('Appointment rescheduled and patient notified.');
      }
    } catch (err) {
      alert('Failed to reschedule: ' + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenCancel = (appt) => {
    setCancelModalAppt(appt);
    setCancellationReason('Emergency schedule conflict');
  };

  const handleConfirmCancel = async (e) => {
    e.preventDefault();
    if (!cancelModalAppt) return;
    try {
      setActionLoading(true);
      const res = await appointmentService.cancelAppointment(cancelModalAppt._id, cancellationReason);
      if (res.success) {
        setCancelModalAppt(null);
        await loadAppointments();
        await loadNotifications();
      }
    } catch (err) {
      alert('Cancellation failed: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Consultation Notes & Rx
  const handleStartConsultation = async (appt) => {
    try {
      await appointmentService.updateStatus(appt._id, 'in_consultation');
      setActiveConsultation(appt);
      setConsultationNotes(appt.consultationNotes || '');
      setPrescriptions(
        appt.prescription?.length > 0
          ? appt.prescription
          : [{ medicineName: '', dosage: '', frequency: '1-0-1', duration: '5 days' }]
      );
      setSelectedTests(appt.prescribedTests?.map(t => t.testName) || []);
      await loadAppointments();
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  };

  const handleAddMedicineRow = () => {
    setPrescriptions([...prescriptions, { medicineName: '', dosage: '', frequency: '1-0-1', duration: '5 days' }]);
  };

  const handleRemoveMedicineRow = (idx) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== idx));
  };

  const handleMedicineChange = (idx, field, value) => {
    const updated = [...prescriptions];
    updated[idx][field] = value;
    setPrescriptions(updated);
  };

  const toggleTestSelection = (testName) => {
    if (selectedTests.includes(testName)) {
      setSelectedTests(selectedTests.filter(t => t !== testName));
    } else {
      setSelectedTests([...selectedTests, testName]);
    }
  };

  const handleSaveConsultation = async (e) => {
    e.preventDefault();
    if (!activeConsultation) return;

    setActionLoading(true);
    try {
      const cleanPrescriptions = prescriptions.filter(p => p.medicineName.trim() !== '');
      const testObjects = selectedTests.map(t => ({ testName: t, urgency: 'routine' }));

      await appointmentService.addConsultationNotes(activeConsultation._id, {
        consultationNotes,
        prescription: cleanPrescriptions,
        prescribedTests: testObjects
      });

      setActiveConsultation(null);
      await loadAppointments();
      alert('Consultation completed and prescription recorded.');
    } catch (err) {
      alert('Failed to save consultation: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Calculations for Stats
  const todayDateStr = new Date().toDateString();
  const todayAppointments = appointments.filter(a => new Date(a.appointmentDate).toDateString() === todayDateStr);
  const pendingRequests = appointments.filter(a => a.status === 'requested');
  const upcomingAppointments = appointments.filter(a => {
    const isFuture = new Date(a.appointmentDate) >= new Date(new Date().setHours(0, 0, 0, 0));
    return isFuture && ['accepted', 'confirmed', 'scheduled', 'requested'].includes(a.status);
  });
  const completedAppointments = appointments.filter(a => a.status === 'completed');
  const cancelledAppointments = appointments.filter(a => ['cancelled', 'rejected'].includes(a.status));

  // Filtered Appointments for the "All Appointments" tab
  const filteredAppointments = appointments.filter(a => {
    if (appointmentFilter === 'ALL') return true;
    if (appointmentFilter === 'TODAY') return new Date(a.appointmentDate).toDateString() === todayDateStr;
    if (appointmentFilter === 'PENDING') return a.status === 'requested';
    if (appointmentFilter === 'ACCEPTED') return ['accepted', 'confirmed', 'scheduled'].includes(a.status);
    if (appointmentFilter === 'COMPLETED') return a.status === 'completed';
    if (appointmentFilter === 'CANCELLED') return ['cancelled', 'rejected'].includes(a.status);
    return true;
  });

  if (loading) {
    return <Loader message="Loading Doctor Clinical Workspace & Queue..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner: Doctor Profile & Quick Availability Switcher */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-sky-600 text-white flex items-center justify-center font-extrabold text-2xl shadow-md border-2 border-sky-400/40">
              {doctorProfile?.profilePhoto ? (
                <img src={doctorProfile.profilePhoto} alt="Profile" className="w-full h-full object-cover rounded-2xl" />
              ) : (
                <Stethoscope className="w-8 h-8" />
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Welcome, {user?.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-400/30">
                  {doctorProfile?.specialization || 'Clinical Specialist'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Hospital: <strong className="text-white">{doctorProfile?.hospitalName || 'MediTrack Clinic'}</strong> &bull; License: <span className="font-mono text-sky-300">{doctorProfile?.medicalLicenseNumber || 'Verified'}</span> &bull; Room: <span className="font-mono text-white">{doctorProfile?.roomNumber || 'OPD-101'}</span>
              </p>
            </div>
          </div>

          {/* Availability Status Selector */}
          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Live Practice Availability Status
            </span>
            <div className="flex items-center space-x-1.5">
              {[
                { key: 'available', label: 'Available', color: 'bg-emerald-500' },
                { key: 'busy', label: 'Busy', color: 'bg-amber-500' },
                { key: 'on_leave', label: 'On Leave', color: 'bg-indigo-500' },
                { key: 'unavailable', label: 'Unavailable', color: 'bg-rose-500' }
              ].map(st => (
                <button
                  key={st.key}
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleQuickStatusChange(st.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                    availabilityStatus === st.key
                      ? 'bg-white text-slate-900 shadow-md ring-2 ring-sky-400'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/60'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${st.color}`}></span>
                  <span>{st.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Today's Queue</span>
            <Calendar className="w-5 h-5 text-sky-600" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{todayAppointments.length}</p>
          <span className="text-[11px] text-slate-400 block mt-1">Patients on schedule today</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Pending Requests</span>
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-3xl font-extrabold text-amber-600">{pendingRequests.length}</p>
          <span className="text-[11px] text-amber-700 font-semibold block mt-1">Requires your acceptance</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Upcoming Visits</span>
            <Users className="w-5 h-5 text-primary-600" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{upcomingAppointments.length}</p>
          <span className="text-[11px] text-slate-400 block mt-1">Confirmed clinical visits</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Completed Visits</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-3xl font-extrabold text-emerald-700">{completedAppointments.length}</p>
          <span className="text-[11px] text-slate-400 block mt-1">Discharged with prescription</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('today')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
            activeTab === 'today'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Today's Schedule ({todayAppointments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
            activeTab === 'all'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>All Appointments ({appointments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('availability')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
            activeTab === 'availability'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Availability & Busy Settings</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
            activeTab === 'profile'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Doctor Profile</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 relative ${
            activeTab === 'notifications'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Notifications</span>
          {unreadNotifCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white">
              {unreadNotifCount}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: TODAY'S SCHEDULE */}
      {activeTab === 'today' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Today's Patient Schedule</h3>
              <p className="text-xs text-slate-500 mt-0.5">{todayDateStr} &bull; Manage live patient consultations</p>
            </div>
            <span className="text-xs font-mono font-bold text-sky-700 bg-sky-50 px-3 py-1.5 rounded-xl border border-sky-200">
              Shift: {scheduleData.workingHours.start} - {scheduleData.workingHours.end} (Break: {scheduleData.breakTime.start} - {scheduleData.breakTime.end})
            </span>
          </div>

          {todayAppointments.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Calendar className="w-12 h-12 mx-auto mb-2 opacity-40 text-slate-400" />
              <p className="text-sm font-semibold text-slate-700">No appointments scheduled for today</p>
              <p className="text-xs text-slate-400 mt-1">New patient bookings will automatically populate here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="py-4 px-6">Time</th>
                    <th className="py-4 px-6">Patient</th>
                    <th className="py-4 px-6">Chief Complaint / Reason</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Clinical Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {todayAppointments.map((appt) => (
                    <tr key={appt._id} className="hover:bg-slate-50/80 transition">
                      <td className="py-4 px-6 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {appt.timeSlot}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900 text-sm">{appt.patientId?.name}</div>
                        <div className="text-[11px] text-slate-500">
                          {appt.patientId?.phone} &bull; Blood: <strong className="text-rose-600">{appt.patientId?.bloodGroup || 'N/A'}</strong>
                        </div>
                      </td>
                      <td className="py-4 px-6 max-w-xs truncate text-slate-600">
                        {appt.reason}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <Badge status={appt.status} />
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap space-x-1.5">
                        {appt.status === 'requested' && (
                          <>
                            <button
                              onClick={() => handleAcceptAppointment(appt._id)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleOpenReject(appt)}
                              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs transition border border-rose-200"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {['accepted', 'confirmed', 'scheduled'].includes(appt.status) && (
                          <>
                            <button
                              onClick={() => handleStartConsultation(appt)}
                              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs transition shadow-xs"
                            >
                              Start Consult
                            </button>
                            <button
                              onClick={() => handleOpenReschedule(appt)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                            >
                              Reschedule
                            </button>
                            <button
                              onClick={() => handleOpenCancel(appt)}
                              className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition"
                            >
                              Cancel
                            </button>
                          </>
                        )}

                        {appt.status === 'in_consultation' && (
                          <button
                            onClick={() => setActiveConsultation(appt)}
                            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition animate-pulse"
                          >
                            Resume Consultation
                          </button>
                        )}

                        {appt.status === 'completed' && (
                          <button
                            onClick={() => setViewRxAppt(appt)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                          >
                            View Prescription
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ALL APPOINTMENTS MANAGEMENT */}
      {activeTab === 'all' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">All Patient Appointments</h3>
              <p className="text-xs text-slate-500 mt-0.5">Filter, accept, reschedule, or cancel patient bookings</p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl text-xs">
              {['ALL', 'PENDING', 'ACCEPTED', 'TODAY', 'COMPLETED', 'CANCELLED'].map(f => (
                <button
                  key={f}
                  onClick={() => setAppointmentFilter(f)}
                  className={`px-3 py-1 rounded-lg font-bold transition ${
                    appointmentFilter === f ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Date & Slot</th>
                  <th className="py-4 px-6">Patient</th>
                  <th className="py-4 px-6">Reason for Visit</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredAppointments.map((appt) => (
                  <tr key={appt._id} className="hover:bg-slate-50/80 transition">
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="font-bold text-slate-900">{new Date(appt.appointmentDate).toDateString()}</div>
                      <div className="text-[11px] font-mono text-sky-700">{appt.timeSlot}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900">{appt.patientId?.name}</div>
                      <div className="text-[11px] text-slate-500">{appt.patientId?.phone || appt.patientId?.email}</div>
                    </td>
                    <td className="py-4 px-6 max-w-xs truncate text-slate-600">
                      {appt.reason}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <Badge status={appt.status} />
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap space-x-1.5">
                      {appt.status === 'requested' && (
                        <>
                          <button
                            onClick={() => handleAcceptAppointment(appt._id)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleOpenReject(appt)}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs transition border border-rose-200"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {['accepted', 'confirmed', 'scheduled'].includes(appt.status) && (
                        <>
                          <button
                            onClick={() => handleStartConsultation(appt)}
                            className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs transition shadow-xs"
                          >
                            Consult
                          </button>
                          <button
                            onClick={() => handleOpenReschedule(appt)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                          >
                            Reschedule
                          </button>
                          <button
                            onClick={() => handleOpenCancel(appt)}
                            className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition"
                          >
                            Cancel
                          </button>
                        </>
                      )}

                      {appt.status === 'in_consultation' && (
                        <button
                          onClick={() => setActiveConsultation(appt)}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition"
                        >
                          Workspace
                        </button>
                      )}

                      {appt.status === 'completed' && (
                        <button
                          onClick={() => setViewRxAppt(appt)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                        >
                          View Rx
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: AVAILABILITY & BUSY SETTINGS */}
      {activeTab === 'availability' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Working Hours & Days Config */}
          <form onSubmit={handleSaveSchedule} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-5">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Weekly Consultation Schedule</h3>
              <p className="text-xs text-slate-500 mt-0.5">Configure regular consultation days and timing</p>
            </div>

            {/* Days */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Available Working Days
              </label>
              <div className="flex flex-wrap gap-1.5">
                {DAYS_OF_WEEK.map((day) => (
                  <button
                    type="button"
                    key={day}
                    onClick={() => toggleScheduleDay(day)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      scheduleData.availableDays.includes(day)
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            {/* Shift start/end */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Shift Start Time</label>
                <input
                  type="time"
                  value={scheduleData.workingHours.start}
                  onChange={(e) => setScheduleData({
                    ...scheduleData,
                    workingHours: { ...scheduleData.workingHours, start: e.target.value }
                  })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Shift End Time</label>
                <input
                  type="time"
                  value={scheduleData.workingHours.end}
                  onChange={(e) => setScheduleData({
                    ...scheduleData,
                    workingHours: { ...scheduleData.workingHours, end: e.target.value }
                  })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            {/* Break start/end */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Break Time Start</label>
                <input
                  type="time"
                  value={scheduleData.breakTime.start}
                  onChange={(e) => setScheduleData({
                    ...scheduleData,
                    breakTime: { ...scheduleData.breakTime, start: e.target.value }
                  })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Break Time End</label>
                <input
                  type="time"
                  value={scheduleData.breakTime.end}
                  onChange={(e) => setScheduleData({
                    ...scheduleData,
                    breakTime: { ...scheduleData.breakTime, end: e.target.value }
                  })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            {/* Slot duration & fee */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Slot Duration (Mins)</label>
                <select
                  value={scheduleData.slotDurationMinutes}
                  onChange={(e) => setScheduleData({ ...scheduleData, slotDurationMinutes: Number(e.target.value) })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value={15}>15 Minutes</option>
                  <option value={20}>20 Minutes</option>
                  <option value={30}>30 Minutes</option>
                  <option value={45}>45 Minutes</option>
                  <option value={60}>60 Minutes</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Consultation Fee (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={scheduleData.consultationFee}
                  onChange={(e) => setScheduleData({ ...scheduleData, consultationFee: Number(e.target.value) })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sky-800"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={actionLoading}
              className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs shadow-xs transition flex items-center justify-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Schedule Preferences</span>
            </button>
          </form>

          {/* Busy & Unavailable Time Manager */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-5">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Busy / Temporary Unavailable Manager</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Block specific time periods (surgeries, emergencies). Patients will be blocked from booking during these hours.
              </p>
            </div>

            {/* Add busy period form */}
            <form onSubmit={handleAddBusyInterval} className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80 space-y-3">
              <span className="block text-xs font-bold uppercase tracking-wider text-amber-900">
                Block Specific Hours (Mark Busy)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={busyDate}
                    onChange={(e) => setBusyDate(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={busyStart}
                    onChange={(e) => setBusyStart(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    value={busyEnd}
                    onChange={(e) => setBusyEnd(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reason (Displayed to Patients)</label>
                <input
                  type="text"
                  required
                  value={busyReason}
                  onChange={(e) => setBusyReason(e.target.value)}
                  placeholder="e.g. Attending emergency surgery"
                  className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-xs transition"
              >
                + Block These Hours as Busy
              </button>
            </form>

            {/* Active Busy Intervals List */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Active Busy Windows ({doctorProfile?.busyIntervals?.length || 0})
                </span>
                {doctorProfile?.busyIntervals?.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearBusyIntervals}
                    className="text-xs font-bold text-rose-600 hover:underline"
                  >
                    Clear All Busy Windows
                  </button>
                )}
              </div>

              {(!doctorProfile?.busyIntervals || doctorProfile.busyIntervals.length === 0) ? (
                <p className="text-xs text-slate-400 italic">No temporary busy intervals active.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {doctorProfile.busyIntervals.map((interval, i) => (
                    <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex justify-between items-center">
                      <div>
                        <span className="font-bold text-slate-900">{new Date(interval.date).toDateString()}</span> &bull; <span className="font-mono text-amber-700 font-bold">{interval.startTime} - {interval.endTime}</span>
                        <p className="text-[11px] text-slate-500">{interval.reason}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">
                        BLOCKED
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DOCTOR PROFILE */}
      {activeTab === 'profile' && (
        <div className="max-w-4xl mx-auto bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Doctor Professional Profile</h3>
              <p className="text-xs text-slate-500 mt-0.5">Visible to prospective patients booking appointments</p>
            </div>
            <span className="px-3 py-1 rounded-xl text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200">
              Licensed Practitioner
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-slate-400 block font-semibold">Medical License Number</span>
              <p className="text-sm font-mono font-bold text-slate-900">{doctorProfile?.medicalLicenseNumber || 'Not Specified'}</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-slate-400 block font-semibold">Specialization</span>
              <p className="text-sm font-bold text-sky-800">{doctorProfile?.specialization}</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-slate-400 block font-semibold">Hospital / Affiliation</span>
              <p className="text-sm font-bold text-slate-900">{doctorProfile?.hospitalName}</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-slate-400 block font-semibold">Qualifications</span>
              <p className="text-sm font-bold text-slate-900">{doctorProfile?.qualifications?.join(', ')}</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-slate-400 block font-semibold">Years of Experience</span>
              <p className="text-sm font-bold text-slate-900">{doctorProfile?.experienceYears} Years</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-slate-400 block font-semibold">Standard Consultation Fee</span>
              <p className="text-sm font-bold text-emerald-700">₹{doctorProfile?.consultationFee}</p>
            </div>
          </div>

          <div>
            <span className="text-xs font-bold text-slate-600 block mb-1">Clinical Bio & Overview</span>
            <p className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
              {doctorProfile?.bio || 'Clinical specialist dedicated to patient outcomes and comprehensive diagnosis.'}
            </p>
          </div>
        </div>
      )}

      {/* TAB 5: NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <div className="max-w-4xl mx-auto bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Clinical Alerts & Appointment Requests</h3>
              <p className="text-xs text-slate-500 mt-0.5">Real-time alerts triggered by patient bookings and cancellations</p>
            </div>
            {notifications.length > 0 && (
              <button
                onClick={async () => {
                  await notificationService.markAllAsRead();
                  await loadNotifications();
                }}
                className="text-xs font-bold text-sky-600 hover:underline"
              >
                Mark All as Read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <p className="text-xs text-slate-400 italic text-center py-8">No notifications received yet.</p>
          ) : (
            <div className="space-y-3">
              {notifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`p-4 rounded-2xl border transition ${
                    notif.isRead
                      ? 'bg-slate-50/70 border-slate-200 text-slate-700'
                      : 'bg-sky-50 border-sky-200 text-sky-900 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs">{notif.title}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} &bull; {new Date(notif.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed">{notif.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* REJECT APPOINTMENT MODAL */}
      {rejectModalAppt && (
        <Modal
          isOpen={!!rejectModalAppt}
          onClose={() => setRejectModalAppt(null)}
          title={`Decline Appointment Request: ${rejectModalAppt.patientId?.name}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleConfirmReject} className="space-y-4">
            <p className="text-xs text-slate-600">
              Provide a professional reason for declining this appointment request. The patient will be notified immediately.
            </p>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Decline Reason
              </label>
              <textarea
                rows={3}
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Schedule fully booked / On emergency hospital duty..."
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalAppt(null)}
                className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
              >
                Dismiss
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="w-1/2 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition shadow-xs"
              >
                Confirm Decline
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* RESCHEDULE APPOINTMENT MODAL */}
      {rescheduleModalAppt && (
        <Modal
          isOpen={!!rescheduleModalAppt}
          onClose={() => setRescheduleModalAppt(null)}
          title={`Reschedule Consultation: ${rescheduleModalAppt.patientId?.name}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleConfirmReschedule} className="space-y-4">
            <div className="p-3 bg-sky-50 rounded-xl border border-sky-100 text-xs">
              <span className="font-bold text-sky-900 block">Current Slot:</span>
              <p className="text-slate-700">{new Date(rescheduleModalAppt.appointmentDate).toDateString()} &bull; {rescheduleModalAppt.timeSlot}</p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Select New Consultation Date
              </label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={rescheduleDate}
                onChange={async (e) => {
                  setRescheduleDate(e.target.value);
                  setRescheduleSlot('');
                  await fetchRescheduleSlots(e.target.value);
                }}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Choose Available Slot
              </label>
              {loadingRescheduleSlots ? (
                <div className="text-xs text-slate-400 py-3 text-center">Checking slot collisions...</div>
              ) : availableRescheduleSlots.length === 0 ? (
                <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-500 text-center">
                  No slots available on this date.
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-1.5 max-h-36 overflow-y-auto">
                  {availableRescheduleSlots.map(s => (
                    <button
                      key={s.slot}
                      type="button"
                      onClick={() => setRescheduleSlot(s.slot)}
                      className={`p-2 rounded-xl text-xs font-bold border transition ${
                        rescheduleSlot === s.slot
                          ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {s.slot}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Reason for Rescheduling
              </label>
              <input
                type="text"
                value={rescheduleReason}
                onChange={(e) => setRescheduleReason(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={actionLoading || !rescheduleSlot}
              className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-xs transition"
            >
              Confirm Reschedule & Notify Patient
            </button>
          </form>
        </Modal>
      )}

      {/* CANCEL MODAL */}
      {cancelModalAppt && (
        <Modal
          isOpen={!!cancelModalAppt}
          onClose={() => setCancelModalAppt(null)}
          title="Cancel Scheduled Appointment"
          maxWidth="max-w-md"
        >
          <form onSubmit={handleConfirmCancel} className="space-y-4">
            <p className="text-xs text-slate-600">
              Are you sure you wish to cancel this appointment with <strong className="text-slate-900">{cancelModalAppt.patientId?.name}</strong>?
            </p>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Cancellation Reason
              </label>
              <input
                type="text"
                required
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalAppt(null)}
                className="w-1/2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
              >
                Dismiss
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="w-1/2 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs"
              >
                Cancel Appointment
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* VIEW RX MODAL */}
      {viewRxAppt && (
        <Modal
          isOpen={!!viewRxAppt}
          onClose={() => setViewRxAppt(null)}
          title={`Clinical Record: ${viewRxAppt.patientId?.name}`}
          maxWidth="max-w-lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-500 block mb-1">Assessment Notes</span>
              <p className="text-slate-800 leading-relaxed">{viewRxAppt.consultationNotes || 'No notes provided.'}</p>
            </div>

            <div>
              <span className="font-bold text-slate-700 block mb-2">Prescribed Medications</span>
              {viewRxAppt.prescription?.length === 0 ? (
                <p className="text-slate-400 italic">No medications recorded.</p>
              ) : (
                <div className="space-y-1.5">
                  {viewRxAppt.prescription?.map((rx, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between">
                      <span className="font-bold text-slate-900">{rx.medicineName} ({rx.dosage})</span>
                      <span className="text-slate-500">{rx.frequency} &bull; {rx.duration}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <span className="font-bold text-slate-700 block mb-2">Prescribed Diagnostic Tests</span>
              {viewRxAppt.prescribedTests?.length === 0 ? (
                <p className="text-slate-400 italic">No lab tests ordered.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {viewRxAppt.prescribedTests?.map((t, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 font-bold border border-sky-200">
                      {t.testName}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* ACTIVE CONSULTATION WORKSPACE MODAL */}
      {activeConsultation && (
        <Modal
          isOpen={!!activeConsultation}
          onClose={() => setActiveConsultation(null)}
          title={`Clinical Consultation: ${activeConsultation.patientId?.name}`}
          maxWidth="max-w-2xl"
        >
          <form onSubmit={handleSaveConsultation} className="space-y-5">
            <div className="bg-sky-50/70 border border-sky-100 rounded-xl p-3.5 flex justify-between items-center text-xs">
              <div>
                <p className="font-bold text-slate-900">{activeConsultation.patientId?.name}</p>
                <p className="text-slate-500">
                  Reason for Visit: <strong className="text-slate-800">{activeConsultation.reason}</strong>
                </p>
              </div>
              <div className="text-right font-mono">
                <span className="text-slate-400 block text-[10px]">Blood Group</span>
                <span className="font-bold text-rose-600">{activeConsultation.patientId?.bloodGroup || 'N/A'}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Clinical Assessment & Diagnosis
              </label>
              <textarea
                rows={3}
                required
                value={consultationNotes}
                onChange={(e) => setConsultationNotes(e.target.value)}
                placeholder="Patient vitals, clinical observations, diagnosis, and dietary instructions..."
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Digital Prescription (Medications)
                </label>
                <button
                  type="button"
                  onClick={handleAddMedicineRow}
                  className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Medicine</span>
                </button>
              </div>

              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {prescriptions.map((p, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2 rounded-xl border border-slate-200/80 text-xs">
                    <input
                      type="text"
                      placeholder="Medicine name (e.g. Paracetamol)"
                      value={p.medicineName}
                      onChange={(e) => handleMedicineChange(idx, 'medicineName', e.target.value)}
                      className="col-span-5 p-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Dosage (500mg)"
                      value={p.dosage}
                      onChange={(e) => handleMedicineChange(idx, 'dosage', e.target.value)}
                      className="col-span-2 p-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Freq (1-0-1)"
                      value={p.frequency}
                      onChange={(e) => handleMedicineChange(idx, 'frequency', e.target.value)}
                      className="col-span-2 p-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                    <input
                      type="text"
                      placeholder="5 days"
                      value={p.duration}
                      onChange={(e) => handleMedicineChange(idx, 'duration', e.target.value)}
                      className="col-span-2 p-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveMedicineRow(idx)}
                      className="col-span-1 p-1 text-slate-400 hover:text-rose-600 text-center"
                    >
                      <Trash2 className="w-4 h-4 mx-auto" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Order Diagnostic Investigations (Optional)
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto pr-1">
                {availableTests.map((t) => (
                  <label
                    key={t._id}
                    className={`p-2 rounded-xl border flex items-center space-x-2 text-xs cursor-pointer transition ${
                      selectedTests.includes(t.testName)
                        ? 'border-sky-500 bg-sky-50 text-sky-900 font-semibold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedTests.includes(t.testName)}
                      onChange={() => toggleTestSelection(t.testName)}
                      className="rounded text-sky-600 focus:ring-sky-500"
                    />
                    <span className="truncate">{t.testName}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={actionLoading}
                className="w-full py-3 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center justify-center space-x-2"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Consultation & Advancing Journey...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Complete Consultation & Issue Digital Prescription</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

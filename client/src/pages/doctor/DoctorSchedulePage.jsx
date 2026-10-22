import React, { useState, useEffect } from 'react';
import { Calendar, Clock, DollarSign, Building, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { doctorService } from '../../services/doctorService';
import { useAuth } from '../../hooks/useAuth';
import { Loader } from '../../components/common/Loader';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const DoctorSchedulePage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [schedule, setSchedule] = useState({
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    workingHours: { start: '09:00', end: '17:00' },
    breakTime: { start: '13:00', end: '14:00' },
    slotDurationMinutes: 30,
    consultationFee: 800,
    roomNumber: 'OPD-302',
    isAvailable: true,
    availabilityStatus: 'available'
  });

  useEffect(() => {
    fetchDoctorProfile();
  }, []);

  const fetchDoctorProfile = async () => {
    try {
      setInitialLoading(true);
      const res = await doctorService.getMyProfile();
      if (res.success && res.data) {
        const d = res.data;
        setSchedule({
          availableDays: d.availableDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          workingHours: {
            start: d.workingHours?.start || '09:00',
            end: d.workingHours?.end || '17:00'
          },
          breakTime: {
            start: d.breakTime?.start || '13:00',
            end: d.breakTime?.end || '14:00'
          },
          slotDurationMinutes: d.slotDurationMinutes || 30,
          consultationFee: d.consultationFee !== undefined ? d.consultationFee : 800,
          roomNumber: d.roomNumber || 'OPD-101',
          isAvailable: d.isAvailable !== undefined ? d.isAvailable : true,
          availabilityStatus: d.availabilityStatus || 'available'
        });
      }
    } catch (err) {
      console.warn('Failed to load doctor profile for schedule:', err.message);
    } finally {
      setInitialLoading(false);
    }
  };

  const toggleDay = (day) => {
    if (schedule.availableDays.includes(day)) {
      setSchedule({
        ...schedule,
        availableDays: schedule.availableDays.filter(d => d !== day)
      });
    } else {
      setSchedule({
        ...schedule,
        availableDays: [...schedule.availableDays, day]
      });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await doctorService.updateSchedule(schedule);
      if (res.success) {
        setSuccessMsg('Your clinical schedule, break times, and consultation preferences have been updated.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to update schedule');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="border-b border-slate-200 pb-6">
        <div className="flex items-center space-x-2 text-sky-700 text-xs font-bold uppercase tracking-wider mb-1">
          <Calendar className="w-4 h-4" />
          <span>Consultation Schedule & OPD Slot Configuration</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Manage OPD Working Hours
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Configure days of consultation, working shifts, and slot intervals for patient bookings
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        {/* Working Days */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
            Active Clinical Consultation Days
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {DAYS_OF_WEEK.map((day) => (
              <button
                type="button"
                key={day}
                onClick={() => toggleDay(day)}
                className={`p-3 rounded-xl border text-xs font-bold transition flex items-center justify-center space-x-2 ${
                  schedule.availableDays.includes(day)
                    ? 'border-sky-600 bg-sky-50 text-sky-800 ring-2 ring-sky-100'
                    : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                <span>{day}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Working Hours */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Shift Start Time (24h)
            </label>
            <input
              type="time"
              value={schedule.workingHours.start}
              onChange={(e) => setSchedule({
                ...schedule,
                workingHours: { ...schedule.workingHours, start: e.target.value }
              })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Shift End Time (24h)
            </label>
            <input
              type="time"
              value={schedule.workingHours.end}
              onChange={(e) => setSchedule({
                ...schedule,
                workingHours: { ...schedule.workingHours, end: e.target.value }
              })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </div>
        </div>

        {/* Break / Lunch Hours */}
        <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200/60 space-y-3">
          <div>
            <p className="text-xs font-bold text-amber-900">Clinical Break / Lunch Interval</p>
            <p className="text-[11px] text-amber-700">Slots during this window are automatically excluded from patient bookings</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Break Start Time</label>
              <input
                type="time"
                value={schedule.breakTime?.start || '13:00'}
                onChange={(e) => setSchedule({
                  ...schedule,
                  breakTime: { ...(schedule.breakTime || {}), start: e.target.value }
                })}
                className="w-full p-2.5 bg-white border border-amber-200 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Break End Time</label>
              <input
                type="time"
                value={schedule.breakTime?.end || '14:00'}
                onChange={(e) => setSchedule({
                  ...schedule,
                  breakTime: { ...(schedule.breakTime || {}), end: e.target.value }
                })}
                className="w-full p-2.5 bg-white border border-amber-200 rounded-xl text-sm"
              />
            </div>
          </div>
        </div>

        {/* Live Availability Status */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Current Clinical Availability Status
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'available', label: 'Available', color: 'emerald' },
              { id: 'busy', label: 'Busy (Procedures)', color: 'amber' },
              { id: 'on_leave', label: 'On Leave', color: 'indigo' },
              { id: 'unavailable', label: 'Unavailable', color: 'rose' }
            ].map(status => (
              <button
                type="button"
                key={status.id}
                onClick={() => setSchedule({ ...schedule, availabilityStatus: status.id })}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                  schedule.availabilityStatus === status.id
                    ? status.id === 'available' ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' :
                      status.id === 'busy' ? 'bg-amber-600 text-white border-amber-600 shadow-xs' :
                      status.id === 'on_leave' ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs' :
                      'bg-rose-600 text-white border-rose-600 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>{status.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Slot Duration, Fee & Room */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Slot Duration (Minutes)
            </label>
            <select
              value={schedule.slotDurationMinutes}
              onChange={(e) => setSchedule({ ...schedule, slotDurationMinutes: Number(e.target.value) })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            >
              <option value={15}>15 Minutes</option>
              <option value={20}>20 Minutes</option>
              <option value={30}>30 Minutes (Recommended)</option>
              <option value={45}>45 Minutes</option>
              <option value={60}>60 Minutes</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Consultation Fee (INR ₹)
            </label>
            <input
              type="number"
              min="0"
              value={schedule.consultationFee}
              onChange={(e) => setSchedule({ ...schedule, consultationFee: Number(e.target.value) })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-sky-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Assigned OPD Room #
            </label>
            <input
              type="text"
              value={schedule.roomNumber}
              onChange={(e) => setSchedule({ ...schedule, roomNumber: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </div>
        </div>

        {/* Active Toggle */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-800">Public OPD Availability</p>
            <p className="text-[11px] text-slate-500">Allow patients to discover profile and book open consultation slots</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={schedule.isAvailable}
              onChange={(e) => setSchedule({ ...schedule, isAvailable: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center justify-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? 'Saving Preferences...' : 'Save Schedule Preferences'}</span>
        </button>
      </form>
    </div>
  );
};

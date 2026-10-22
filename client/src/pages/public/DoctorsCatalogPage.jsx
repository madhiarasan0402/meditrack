import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Stethoscope, 
  Search, 
  Calendar, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle, 
  Building, 
  ArrowRight,
  Loader2
} from 'lucide-react';
import { doctorService } from '../../services/doctorService';
import { appointmentService } from '../../services/appointmentService';
import { useAuth } from '../../hooks/useAuth';
import { useJourney } from '../../hooks/useJourney';
import { Modal } from '../../components/common/Modal';
import { Loader } from '../../components/common/Loader';
import { MockPaymentModal } from '../../components/payment/MockPaymentModal';

const SPECIALIZATIONS = [
  'All',
  'Cardiology',
  'General Medicine',
  'Dermatology',
  'Pediatrics',
  'Orthopedics',
  'Neurology'
];

export const DoctorsCatalogPage = () => {
  const { user, isPatient } = useAuth();
  const { refreshActiveJourney, refreshAllJourneys } = useJourney();
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Booking Modal State
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookingDate, setBookingDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [reason, setReason] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [doctorAvailabilityNotice, setDoctorAvailabilityNotice] = useState('');
  const [isDoctorAvailableForDate, setIsDoctorAvailableForDate] = useState(true);

  // Payment Modal Trigger State
  const [paymentModalData, setPaymentModalData] = useState(null);

  useEffect(() => {
    fetchDoctors();
  }, [selectedSpecialty]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await doctorService.getAllDoctors({
        specialization: selectedSpecialty !== 'All' ? selectedSpecialty : undefined
      });
      if (res.success) {
        setDoctors(res.data);
      }
    } catch (err) {
      console.error('Error fetching doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenBooking = async (doctor) => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/doctors' } } });
      return;
    }
    if (!isPatient) {
      alert('Only registered patients can book clinical appointments.');
      return;
    }

    setSelectedDoctor(doctor);
    setBookingError('');
    setSelectedSlot('');
    setReason('');
    setDoctorAvailabilityNotice('');
    setIsDoctorAvailableForDate(true);
    await fetchSlotsForDate(doctor._id, bookingDate);
  };

  const fetchSlotsForDate = async (doctorId, date) => {
    try {
      setLoadingSlots(true);
      setDoctorAvailabilityNotice('');
      const res = await doctorService.getDoctorSlots(doctorId, date);
      if (res.success) {
        setSlots(res.data || []);
        setIsDoctorAvailableForDate(res.isDoctorAvailable !== false);
        if (res.isDoctorAvailable === false) {
          setDoctorAvailabilityNotice(res.message || 'Doctor is unavailable during this time. Please select another available slot.');
        }
      }
    } catch (err) {
      console.warn('Could not load slots:', err.message);
      setSlots([]);
      setIsDoctorAvailableForDate(false);
      setDoctorAvailabilityNotice(err.response?.data?.message || 'Doctor is unavailable during this time. Please select another available slot.');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleDateChange = async (e) => {
    const newDate = e.target.value;
    setBookingDate(newDate);
    setSelectedSlot('');
    if (selectedDoctor) {
      await fetchSlotsForDate(selectedDoctor._id, newDate);
    }
  };

  const handleConfirmAppointmentHold = async (e) => {
    e.preventDefault();
    if (!selectedSlot) {
      setBookingError('Please choose an available appointment time slot');
      return;
    }

    if (!isDoctorAvailableForDate) {
      setBookingError('Doctor is unavailable during this time. Please select another available slot.');
      return;
    }

    setSubmittingBooking(true);
    setBookingError('');

    try {
      const res = await appointmentService.createAppointment({
        doctorId: selectedDoctor._id,
        appointmentDate: bookingDate,
        timeSlot: selectedSlot,
        reason: reason || 'Routine Clinical Consultation'
      });

      if (res.success) {
        const appt = res.data.appointment;
        // Close slot modal
        const doctorName = selectedDoctor.userId?.name || 'Physician';
        setSelectedDoctor(null);

        // Open Mock Payment Modal immediately
        setPaymentModalData({
          referenceType: 'Appointment',
          referenceId: appt._id,
          title: `OPD Consultation with ${doctorName}`,
          amount: selectedDoctor.consultationFee
        });
      }
    } catch (err) {
      setBookingError(err.response?.data?.message || err.message || 'Failed to book slot');
    } finally {
      setSubmittingBooking(false);
    }
  };

  const filteredDoctors = doctors.filter((doc) => {
    const nameMatch = doc.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const specMatch = doc.specialization?.toLowerCase().includes(searchTerm.toLowerCase());
    return nameMatch || specMatch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Consult Our Medical Specialists
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Choose a specialist doctor, select an available consultation slot, and monitor your care journey
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search doctor or specialty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-xs"
          />
        </div>
      </div>

      {/* Specialty Filter Buttons */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {SPECIALIZATIONS.map((spec) => (
          <button
            key={spec}
            onClick={() => setSelectedSpecialty(spec)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              selectedSpecialty === spec
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {spec}
          </button>
        ))}
      </div>

      {/* Doctors Grid */}
      {loading ? (
        <Loader message="Loading available specialist roster..." />
      ) : filteredDoctors.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <Stethoscope className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No doctors found</h3>
          <p className="text-xs text-slate-500 mt-1">Try selecting another specialty or clearing the search box</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doc) => (
            <div
              key={doc._id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-primary-300 transition flex flex-col justify-between p-6"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-lg overflow-hidden border border-primary-200">
                      {doc.profilePhoto ? (
                        <img src={doc.profilePhoto} alt={doc.userId?.name} className="w-full h-full object-cover" />
                      ) : (
                        doc.userId?.name?.replace('Dr. ', '').charAt(0) || 'D'
                      )}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{doc.userId?.name}</h3>
                      <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded-md bg-primary-50 text-primary-700 border border-primary-100 mt-0.5">
                        {doc.specialization}
                      </span>
                    </div>
                  </div>
                  
                  {/* Doctor Availability Status Badge */}
                  <div className="flex flex-col items-end">
                    <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${
                      doc.availabilityStatus === 'available'
                        ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                        : doc.availabilityStatus === 'busy'
                        ? 'text-amber-700 bg-amber-50 border-amber-200'
                        : doc.availabilityStatus === 'on_leave'
                        ? 'text-indigo-700 bg-indigo-50 border-indigo-200'
                        : 'text-rose-700 bg-rose-50 border-rose-200'
                    }`}>
                      {doc.availabilityStatus === 'available' ? 'Available' :
                       doc.availabilityStatus === 'busy' ? 'Busy' :
                       doc.availabilityStatus === 'on_leave' ? 'On Leave' : 'Unavailable'}
                    </span>
                  </div>
                </div>

                {doc.hospitalName && (
                  <div className="flex items-center space-x-1.5 text-xs text-slate-600 font-medium">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span>{doc.hospitalName}</span>
                  </div>
                )}

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                  {doc.bio || `${doc.experienceYears} years experience in clinical diagnosis and outpatient consultation.`}
                </p>

                {doc.availabilityStatus && doc.availabilityStatus !== 'available' && (
                  <div className="p-2 bg-amber-50/80 border border-amber-200 rounded-xl text-[11px] text-amber-800 flex items-center space-x-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                    <span>Doctor is currently {doc.availabilityStatus.replace('_', ' ')}. You can still inspect schedule dates.</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 block font-semibold">Qualifications</span>
                    <span className="font-bold text-slate-700 truncate block">{doc.qualifications?.join(', ') || 'MBBS'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">OPD Room</span>
                    <span className="font-bold text-slate-700">{doc.roomNumber || 'Room 101'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Experience</span>
                    <span className="font-bold text-slate-700">{doc.experienceYears} Years</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Consultation Fee</span>
                    <span className="font-bold text-primary-700">₹{doc.consultationFee}</span>
                  </div>
                </div>

                <div className="space-y-1 text-[11px] text-slate-500">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Hours: {doc.workingHours?.start} - {doc.workingHours?.end} ({doc.slotDurationMinutes || 30} min slots)</span>
                  </div>
                  {doc.breakTime?.start && (
                    <div className="text-[10px] text-slate-400 pl-4.5">
                      Break / Lunch: {doc.breakTime.start} - {doc.breakTime.end}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  onClick={() => handleOpenBooking(doc)}
                  className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-xs shadow-xs transition flex items-center justify-center space-x-2"
                >
                  <span>Select Slot & Book</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Appointment Slot Picker Modal */}
      {selectedDoctor && (
        <Modal
          isOpen={!!selectedDoctor}
          onClose={() => setSelectedDoctor(null)}
          title={`Book Consultation: ${selectedDoctor.userId?.name}`}
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleConfirmAppointmentHold} className="space-y-4">
            {bookingError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{bookingError}</span>
              </div>
            )}

            {doctorAvailabilityNotice && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs flex items-start space-x-2.5">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">{doctorAvailabilityNotice}</p>
                  <p className="text-[11px] text-amber-700 mt-0.5">
                    Doctor is unavailable during this time. Please select another available slot or change date.
                  </p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Choose Consultation Date
              </label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={bookingDate}
                onChange={handleDateChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Consultation Slots ({slots.filter(s => s.isAvailable).length} Available)
                </label>
                <div className="flex items-center space-x-2 text-[10px] text-slate-400">
                  <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-emerald-500 mr-1"></span>Open</span>
                  <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-slate-300 mr-1"></span>Booked</span>
                  <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-amber-400 mr-1"></span>Busy/Break</span>
                </div>
              </div>

              {loadingSlots ? (
                <div className="py-6 text-center text-xs text-slate-500 flex items-center justify-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary-600" />
                  <span>Checking slot availability and doctor schedule...</span>
                </div>
              ) : slots.length === 0 ? (
                <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-500 border border-slate-100">
                  {doctorAvailabilityNotice || 'Doctor has no operating schedule on this date. Please pick another date.'}
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
                  {slots.map((item) => {
                    const isSelectable = item.isAvailable;
                    let tag = '';
                    if (item.isBooked) tag = 'Booked';
                    else if (item.isBreak) tag = 'Break';
                    else if (item.isBusy) tag = 'Busy';

                    return (
                      <button
                        key={item.slot}
                        type="button"
                        disabled={!isSelectable}
                        onClick={() => setSelectedSlot(item.slot)}
                        title={item.reasonIfUnavailable || 'Available for booking'}
                        className={`p-2 rounded-xl text-xs font-semibold text-center border transition flex flex-col items-center justify-center ${
                          !isSelectable
                            ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-70'
                            : selectedSlot === item.slot
                            ? 'bg-primary-600 text-white border-primary-600 ring-2 ring-primary-200 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-primary-400 hover:bg-primary-50/20'
                        }`}
                      >
                        <span className={item.isBooked ? 'line-through' : ''}>{item.slot}</span>
                        {tag && (
                          <span className={`text-[9px] uppercase font-bold mt-0.5 ${
                            tag === 'Booked' ? 'text-slate-400' :
                            tag === 'Break' ? 'text-amber-600' : 'text-rose-600'
                          }`}>
                            {tag}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Symptoms / Chief Complaint
              </label>
              <textarea
                rows={2}
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Mild chest tightness and follow up on blood pressure..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="p-3 bg-primary-50/70 border border-primary-100 rounded-xl flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700">Fee Payable at Checkout:</span>
              <span className="text-base font-extrabold text-primary-700">₹{selectedDoctor.consultationFee}</span>
            </div>

            <button
              type="submit"
              disabled={submittingBooking || !selectedSlot || !isDoctorAvailableForDate}
              className="w-full py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center justify-center space-x-2"
            >
              {submittingBooking ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Locking Slot & Initiating Journey...</span>
                </>
              ) : (
                <>
                  <span>Reserve Slot & Proceed to Mock Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </Modal>
      )}

      {/* Mock Payment Modal */}
      {paymentModalData && (
        <MockPaymentModal
          isOpen={!!paymentModalData}
          bookingDetails={paymentModalData}
          onClose={() => setPaymentModalData(null)}
          onPaymentSuccess={() => {
            refreshActiveJourney();
            refreshAllJourneys();
            navigate('/patient/dashboard');
          }}
        />
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Activity, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  MapPin, 
  AlertCircle, 
  Loader2, 
  ArrowRight,
  Stethoscope,
  HeartHandshake,
  Award,
  Building,
  DollarSign,
  Calendar,
  Clock,
  FileBadge
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const SPECIALIZATIONS = [
  'General Medicine',
  'Cardiology',
  'Dermatology',
  'Pediatrics',
  'Orthopedics',
  'Neurology',
  'Gynecology',
  'Pathology',
  'ENT',
  'Ophthalmology',
  'Psychiatry',
  'Radiology',
  'Pulmonology'
];

export const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const requestedRole = searchParams.get('role');
  const [role, setRole] = useState(requestedRole === 'doctor' ? 'doctor' : 'patient');

  // Common Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gender, setGender] = useState('female');
  const [dateOfBirth, setDateOfBirth] = useState('1995-01-01');

  // Address
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('Chennai');
  const [state, setState] = useState('Tamil Nadu');
  const [zipCode, setZipCode] = useState('600001');

  // Patient-specific
  const [bloodGroup, setBloodGroup] = useState('B+');

  // Doctor-specific
  const [medicalLicenseNumber, setMedicalLicenseNumber] = useState('');
  const [specialization, setSpecialization] = useState('General Medicine');
  const [qualification, setQualification] = useState('MBBS, MD');
  const [experienceYears, setExperienceYears] = useState(5);
  const [hospitalName, setHospitalName] = useState('MediTrack Healthcare Center');
  const [consultationFee, setConsultationFee] = useState(600);
  const [profilePhoto, setProfilePhoto] = useState('');
  const [availableDays, setAvailableDays] = useState(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
  const [workingStart, setWorkingStart] = useState('09:00');
  const [workingEnd, setWorkingEnd] = useState('17:00');
  const [breakStart, setBreakStart] = useState('13:00');
  const [breakEnd, setBreakEnd] = useState('14:00');

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const toggleDay = (day) => {
    if (availableDays.includes(day)) {
      if (availableDays.length === 1) {
        alert('Please select at least one available consultation day.');
        return;
      }
      setAvailableDays(availableDays.filter(d => d !== day));
    } else {
      setAvailableDays([...availableDays, day]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!/^[^\s@]+@gmail\.com$/i.test(email.trim())) {
      setError('Please use a valid Gmail address ending with @gmail.com.');
      return;
    }

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (role === 'doctor') {
      if (!medicalLicenseNumber.trim()) {
        setError('Medical License Number is required for doctor registration.');
        return;
      }
      if (!qualification.trim()) {
        setError('Doctor qualifications are required.');
        return;
      }
      if (Number(consultationFee) < 0) {
        setError('Consultation fee cannot be negative.');
        return;
      }
      if (availableDays.length === 0) {
        setError('Please select at least one available working day.');
        return;
      }
    }

    setSubmitting(true);

    try {
      const payload = {
        name: role === 'doctor' && !name.toLowerCase().startsWith('dr') ? `Dr. ${name.trim()}` : name.trim(),
        email: email.trim(),
        password,
        phone: phone.trim(),
        role,
        gender,
        dateOfBirth,
        address: { street, city, state, zipCode }
      };

      if (role === 'patient') {
        payload.bloodGroup = bloodGroup;
      } else {
        payload.medicalLicenseNumber = medicalLicenseNumber.trim();
        payload.specialization = specialization;
        payload.qualification = qualification.split(',').map(q => q.trim()).filter(Boolean);
        payload.experienceYears = Number(experienceYears);
        payload.hospitalName = hospitalName.trim();
        payload.consultationFee = Number(consultationFee);
        payload.profilePhoto = profilePhoto.trim();
        payload.availableDays = availableDays;
        payload.workingHours = { start: workingStart, end: workingEnd };
        payload.breakTime = { start: breakStart, end: breakEnd };
      }

      await register(payload);

      if (role === 'doctor') {
        navigate('/doctor/dashboard');
      } else {
        navigate('/patient/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl text-center">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-700 to-cyan-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-primary-600/30">
          <Activity className="w-7 h-7" />
        </div>
        <h2 className="mt-4 text-3xl font-extrabold text-slate-900 tracking-tight">
          Join MediTrack Platform
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Select your account type to begin managing or tracking clinical care
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-6 shadow-xl border border-slate-200/80 rounded-3xl sm:px-10 space-y-6">
          {/* Role Selection Tabs */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 text-center">
              Choose Account Type
            </label>
            <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => { setRole('patient'); setError(''); }}
                className={`py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center space-x-2 transition ${
                  role === 'patient'
                    ? 'bg-white text-primary-700 shadow-sm ring-2 ring-primary-100'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <HeartHandshake className="w-4 h-4 text-primary-600" />
                <span>Patient Account</span>
              </button>

              <button
                type="button"
                onClick={() => { setRole('doctor'); setError(''); }}
                className={`py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center space-x-2 transition ${
                  role === 'doctor'
                    ? 'bg-white text-sky-700 shadow-sm ring-2 ring-sky-100'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Stethoscope className="w-4 h-4 text-sky-600" />
                <span>Doctor / Clinician</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  {role === 'doctor' ? 'Doctor Full Name' : 'Full Name'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={role === 'doctor' ? 'e.g. Arun Kumar' : 'e.g. John Miller'}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@gmail.com"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>

            {/* Phone & Gender & DOB */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98401..."
                    className="w-full pl-9 pr-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>

            {/* PATIENT SPECIFIC: Blood Group */}
            {role === 'patient' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Blood Group
                </label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown'].map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            )}

            {/* DOCTOR SPECIFIC FIELDS */}
            {role === 'doctor' && (
              <div className="p-4 bg-sky-50/50 rounded-2xl border border-sky-100 space-y-4">
                <div className="flex items-center space-x-2 text-sky-800 text-xs font-bold uppercase tracking-wider">
                  <FileBadge className="w-4 h-4 text-sky-600" />
                  <span>Doctor Credentials & Professional Details</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Medical License Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={medicalLicenseNumber}
                      onChange={(e) => setMedicalLicenseNumber(e.target.value)}
                      placeholder="e.g. MCI-2024-8849"
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Specialization *
                    </label>
                    <select
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500"
                    >
                      {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Qualifications *
                    </label>
                    <input
                      type="text"
                      required
                      value={qualification}
                      onChange={(e) => setQualification(e.target.value)}
                      placeholder="e.g. MBBS, MD, FRCP"
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Experience (Years)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Consultation Fee (INR ₹) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={consultationFee}
                      onChange={(e) => setConsultationFee(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-sky-800 focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Hospital / Clinic Name
                    </label>
                    <input
                      type="text"
                      value={hospitalName}
                      onChange={(e) => setHospitalName(e.target.value)}
                      placeholder="e.g. Apollo Hospitals / MediTrack Care"
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Profile Photo URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={profilePhoto}
                      onChange={(e) => setProfilePhoto(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                {/* Available Days */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                    Available Consultation Days
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {DAYS_OF_WEEK.map((day) => (
                      <button
                        type="button"
                        key={day}
                        onClick={() => toggleDay(day)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                          availableDays.includes(day)
                            ? 'bg-sky-600 text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Working Hours & Break Time */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Shift Start</label>
                    <input
                      type="time"
                      value={workingStart}
                      onChange={(e) => setWorkingStart(e.target.value)}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Shift End</label>
                    <input
                      type="time"
                      value={workingEnd}
                      onChange={(e) => setWorkingEnd(e.target.value)}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Break Start</label>
                    <input
                      type="time"
                      value={breakStart}
                      onChange={(e) => setBreakStart(e.target.value)}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Break End</label>
                    <input
                      type="time"
                      value={breakEnd}
                      onChange={(e) => setBreakEnd(e.target.value)}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Address */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                {role === 'doctor' ? 'Clinic / Practice Address' : 'Address (City, State)'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Street / Area"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white"
                />
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-3 text-white font-bold rounded-xl shadow-md text-sm transition flex items-center justify-center space-x-2 ${
                role === 'doctor'
                  ? 'bg-sky-600 hover:bg-sky-700 shadow-sky-600/20'
                  : 'bg-primary-600 hover:bg-primary-700 shadow-primary-600/20'
              }`}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating {role === 'doctor' ? 'Doctor' : 'Patient'} Account...</span>
                </>
              ) : (
                <>
                  <span>Register as {role === 'doctor' ? 'Licensed Doctor' : 'Patient'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-primary-600 hover:underline">
              Log in to your portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

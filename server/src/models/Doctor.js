import mongoose from 'mongoose';
import { DOCTOR_AVAILABILITY_STATUS } from '../config/constants.js';

const busyIntervalSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  startTime: { type: String, required: true }, // "HH:mm"
  endTime: { type: String, required: true },   // "HH:mm"
  reason: { type: String, default: 'Doctor is busy during this time' }
}, { _id: false });

const doctorSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    unique: true 
  },
  medicalLicenseNumber: {
    type: String,
    trim: true,
    unique: true,
    sparse: true
  },
  specialization: { 
    type: String, 
    required: true,
    trim: true
  },
  qualifications: [{ type: String, required: true }],
  experienceYears: { type: Number, required: true, min: 0 },
  hospitalName: { type: String, default: 'MediTrack Healthcare Center', trim: true },
  consultationFee: { type: Number, required: true, min: 0 },
  profilePhoto: { type: String, default: '' },
  address: {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    zipCode: { type: String, default: '' }
  },
  availableDays: [{ 
    type: String, 
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  }],
  workingHours: {
    start: { type: String, default: '09:00' },
    end: { type: String, default: '17:00' }
  },
  breakTime: {
    start: { type: String, default: '13:00' },
    end: { type: String, default: '14:00' }
  },
  slotDurationMinutes: { type: Number, default: 30, min: 10, max: 120 },
  roomNumber: { type: String, default: 'OPD-101' },
  availabilityStatus: {
    type: String,
    enum: Object.values(DOCTOR_AVAILABILITY_STATUS),
    default: DOCTOR_AVAILABILITY_STATUS.AVAILABLE,
    index: true
  },
  busyIntervals: [busyIntervalSchema],
  bio: { type: String, default: '' },
  isAvailable: { type: Boolean, default: true }
}, { timestamps: true });

doctorSchema.index({ specialization: 1, availabilityStatus: 1, isAvailable: 1 });

export const Doctor = mongoose.model('Doctor', doctorSchema);

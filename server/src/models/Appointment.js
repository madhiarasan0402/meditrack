import mongoose from 'mongoose';
import { APPOINTMENT_STATUS } from '../config/constants.js';

const appointmentSchema = new mongoose.Schema({
  patientId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  doctorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Doctor', 
    required: true, 
    index: true 
  },
  appointmentDate: { type: Date, required: true },
  timeSlot: { type: String, required: true }, // e.g., "10:30-11:00"
  startTime: { type: String },                // "10:30"
  endTime: { type: String },                  // "11:00"
  reason: { type: String, required: true },
  status: { 
    type: String, 
    enum: Object.values(APPOINTMENT_STATUS), 
    default: APPOINTMENT_STATUS.REQUESTED,
    index: true
  },
  rejectionReason: { type: String, default: '' },
  cancellationReason: { type: String, default: '' },
  rescheduledFrom: {
    date: { type: Date },
    timeSlot: { type: String }
  },
  fee: { type: Number, required: true },
  consultationNotes: { type: String, default: '' },
  prescription: [{
    medicineName: { type: String, required: true },
    dosage: { type: String, required: true },
    frequency: { type: String, required: true },
    duration: { type: String, required: true }
  }],
  prescribedTests: [{
    testName: String,
    testCode: String,
    urgency: { type: String, enum: ['routine', 'urgent'], default: 'routine' }
  }],
  journeyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'HealthcareJourney' 
  }
}, { timestamps: true });

// Prevent double bookings on the same doctor, date, and timeslot for active appointments
appointmentSchema.index(
  { doctorId: 1, appointmentDate: 1, timeSlot: 1 }, 
  { 
    unique: true, 
    partialFilterExpression: { status: { $nin: ['cancelled', 'rejected'] } } 
  }
);

// Prevent patient conflict: patient cannot have multiple overlapping active appointments
appointmentSchema.index(
  { patientId: 1, appointmentDate: 1, timeSlot: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $nin: ['cancelled', 'rejected'] } }
  }
);

export const Appointment = mongoose.model('Appointment', appointmentSchema);

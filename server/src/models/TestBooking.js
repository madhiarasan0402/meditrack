import mongoose from 'mongoose';
import { TEST_BOOKING_STATUS } from '../config/constants.js';

const testBookingSchema = new mongoose.Schema({
  patientId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  testId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'DiagnosticTest', 
    required: true 
  },
  bookingDate: { type: Date, required: true },
  timeSlot: { type: String, required: true }, // e.g. "08:00-09:00"
  collectionType: { 
    type: String, 
    enum: ['lab_visit', 'home_collection'], 
    default: 'lab_visit' 
  },
  collectionAddress: {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    zipCode: { type: String, default: '' }
  },
  status: { 
    type: String, 
    enum: Object.values(TEST_BOOKING_STATUS), 
    default: TEST_BOOKING_STATUS.PENDING_PAYMENT,
    index: true 
  },
  amount: { type: Number, required: true },
  journeyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'HealthcareJourney' 
  }
}, { timestamps: true });

testBookingSchema.index({ bookingDate: 1, status: 1 });

export const TestBooking = mongoose.model('TestBooking', testBookingSchema);

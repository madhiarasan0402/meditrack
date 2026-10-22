import mongoose from 'mongoose';
import { REPORT_STATUS } from '../config/constants.js';

const reportSchema = new mongoose.Schema({
  patientId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  testBookingId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'TestBooking', 
    required: true, 
    unique: true 
  },
  testName: { type: String, required: true },
  uploadedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  fileUrl: { type: String, required: true },
  originalFileName: { type: String, required: true },
  fileMimeType: { type: String, required: true },
  fileSizeBytes: { type: Number, required: true },
  clinicalRemarks: { type: String, default: 'Normal parameters observed.' },
  status: { 
    type: String, 
    enum: Object.values(REPORT_STATUS), 
    default: REPORT_STATUS.UPLOADED,
    index: true 
  },
  firstViewedAt: { type: Date },
  journeyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'HealthcareJourney' 
  }
}, { timestamps: true });

export const Report = mongoose.model('Report', reportSchema);

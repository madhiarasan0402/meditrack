import mongoose from 'mongoose';
import { JOURNEY_STAGES } from '../config/constants.js';

const journeyEventSchema = new mongoose.Schema({
  stage: { 
    type: String, 
    required: true, 
    enum: Object.values(JOURNEY_STAGES) 
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  actorRole: { 
    type: String, 
    enum: ['patient', 'doctor', 'admin', 'system'], 
    required: true 
  },
  actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  metadata: { type: Map, of: String }
}, { _id: false });

const healthcareJourneySchema = new mongoose.Schema({
  patientId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  journeyType: { 
    type: String, 
    required: true, 
    enum: ['doctor_consultation', 'diagnostic_investigation'] 
  },
  title: { type: String, required: true },
  referenceType: { 
    type: String, 
    required: true, 
    enum: ['Appointment', 'TestBooking'] 
  },
  referenceId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true, 
    refPath: 'referenceType' 
  },
  currentStage: { 
    type: String, 
    required: true, 
    enum: Object.values(JOURNEY_STAGES),
    default: JOURNEY_STAGES.INITIATED
  },
  isCompleted: { type: Boolean, default: false },
  events: [journeyEventSchema]
}, { timestamps: true });

healthcareJourneySchema.index({ patientId: 1, currentStage: 1 });
healthcareJourneySchema.index({ referenceId: 1 });

export const HealthcareJourney = mongoose.model('HealthcareJourney', healthcareJourneySchema);

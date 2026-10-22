import mongoose from 'mongoose';
import { PAYMENT_STATUS } from '../config/constants.js';

const paymentSchema = new mongoose.Schema({
  patientId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
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
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  transactionId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  paymentMethod: { 
    type: String, 
    enum: ['mock_card', 'mock_upi', 'mock_netbanking'], 
    required: true 
  },
  paymentStatus: { 
    type: String, 
    enum: Object.values(PAYMENT_STATUS), 
    default: PAYMENT_STATUS.INITIATED,
    index: true
  },
  gatewayResponse: {
    simulationCode: { type: String, default: '' },
    receiptNumber: { type: String, default: '' },
    authCode: { type: String, default: '' }
  },
  paidAt: { type: Date },
  refundRequestedAt: { type: Date },
  refundDueAt: { type: Date },
  refundedAt: { type: Date },
  refundReason: { type: String, default: '' }
}, { timestamps: true });

paymentSchema.index({ referenceId: 1, paymentStatus: 1 });

export const Payment = mongoose.model('Payment', paymentSchema);

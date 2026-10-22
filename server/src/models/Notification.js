import mongoose from 'mongoose';
import { NOTIFICATION_TYPES } from '../config/constants.js';

const notificationSchema = new mongoose.Schema({
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: Object.values(NOTIFICATION_TYPES),
    default: NOTIFICATION_TYPES.APPOINTMENT_REQUESTED
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId
  },
  relatedType: {
    type: String,
    default: 'Appointment'
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  }
}, { timestamps: true });

notificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });

export const Notification = mongoose.model('Notification', notificationSchema);

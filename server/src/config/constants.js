export const ROLES = {
  PATIENT: 'patient',
  DOCTOR: 'doctor',
  ADMIN: 'admin'
};

export const APPOINTMENT_STATUS = {
  PENDING_PAYMENT: 'pending_payment',
  REQUESTED: 'requested',
  ACCEPTED: 'accepted',
  SCHEDULED: 'scheduled',
  CONFIRMED: 'confirmed',
  IN_CONSULTATION: 'in_consultation',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REJECTED: 'rejected',
  RESCHEDULED: 'rescheduled'
};

export const DOCTOR_AVAILABILITY_STATUS = {
  AVAILABLE: 'available',
  BUSY: 'busy',
  ON_LEAVE: 'on_leave',
  UNAVAILABLE: 'unavailable'
};

export const NOTIFICATION_TYPES = {
  APPOINTMENT_REQUESTED: 'appointment_requested',
  APPOINTMENT_ACCEPTED: 'appointment_accepted',
  APPOINTMENT_REJECTED: 'appointment_rejected',
  APPOINTMENT_RESCHEDULED: 'appointment_rescheduled',
  APPOINTMENT_CANCELLED: 'appointment_cancelled',
  APPOINTMENT_COMPLETED: 'appointment_completed',
  DOCTOR_STATUS_CHANGED: 'doctor_status_changed'
};

export const TEST_BOOKING_STATUS = {
  PENDING_PAYMENT: 'pending_payment',
  CONFIRMED: 'confirmed',
  SAMPLE_COLLECTED: 'sample_collected',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

export const PAYMENT_STATUS = {
  INITIATED: 'initiated',
  SUCCESSFUL: 'successful',
  FAILED: 'failed',
  REFUNDED: 'refunded'
};

export const JOURNEY_STAGES = {
  INITIATED: 'initiated',
  PAYMENT_PENDING: 'payment_pending',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in_progress',
  SAMPLE_COLLECTED: 'sample_collected',
  REPORT_READY: 'report_ready',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REJECTED: 'cancelled'
};

export const REPORT_STATUS = {
  UPLOADED: 'uploaded',
  PUBLISHED: 'published',
  VIEWED: 'viewed'
};

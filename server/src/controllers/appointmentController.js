import { Appointment } from '../models/Appointment.js';
import { Doctor } from '../models/Doctor.js';
import { User } from '../models/User.js';
import { Notification } from '../models/Notification.js';
import { HealthcareJourney } from '../models/HealthcareJourney.js';
import { logJourneyEvent } from '../utils/journeyDispatcher.js';
import { sendAppointmentConfirmationEmail } from '../services/emailService.js';
import { 
  APPOINTMENT_STATUS, 
  PAYMENT_STATUS,
  JOURNEY_STAGES, 
  DOCTOR_AVAILABILITY_STATUS,
  NOTIFICATION_TYPES 
} from '../config/constants.js';

const timeToMinutes = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

export const createAppointment = async (req, res, next) => {
  try {
    const { doctorId, appointmentDate, timeSlot, reason } = req.body;
    const patientId = req.user._id;

    if (!doctorId || !appointmentDate || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: 'Doctor ID, appointment date, and time slot are required.'
      });
    }

    const doctor = await Doctor.findById(doctorId).populate('userId', 'name email phone');
    if (!doctor || !doctor.isAvailable) {
      return res.status(404).json({
        success: false,
        message: 'Doctor is unavailable or does not exist.'
      });
    }

    // Check doctor status (Busy / On Leave / Unavailable)
    if (doctor.availabilityStatus && doctor.availabilityStatus !== DOCTOR_AVAILABILITY_STATUS.AVAILABLE) {
      return res.status(400).json({
        success: false,
        message: 'Doctor is unavailable during this time. Please select another available slot.'
      });
    }

    const apptDate = new Date(appointmentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfDay = new Date(apptDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(apptDate);
    endOfDay.setHours(23, 59, 59, 999);

    if (startOfDay < today) {
      return res.status(400).json({
        success: false,
        message: 'Cannot schedule appointments on past dates.'
      });
    }

    // Check day of week
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const targetDayName = dayNames[apptDate.getDay()];
    if (!doctor.availableDays.includes(targetDayName)) {
      return res.status(400).json({
        success: false,
        message: `Dr. ${doctor.userId?.name} does not consult on ${targetDayName}s.`
      });
    }

    // Check working hours and break time
    const [slotStartStr, slotEndStr] = timeSlot.split('-');
    const slotStartM = timeToMinutes(slotStartStr);
    const slotEndM = timeToMinutes(slotEndStr);
    const workStartM = timeToMinutes(doctor.workingHours?.start || '09:00');
    const workEndM = timeToMinutes(doctor.workingHours?.end || '17:00');
    const breakStartM = timeToMinutes(doctor.breakTime?.start || '13:00');
    const breakEndM = timeToMinutes(doctor.breakTime?.end || '14:00');

    if (slotStartM < workStartM || slotEndM > workEndM) {
      return res.status(400).json({
        success: false,
        message: `Selected slot is outside doctor's working hours (${doctor.workingHours?.start} - ${doctor.workingHours?.end}).`
      });
    }

    if (slotStartM < breakEndM && slotEndM > breakStartM) {
      return res.status(400).json({
        success: false,
        message: 'Selected slot conflicts with doctor\'s break hours.'
      });
    }

    // Check custom busy intervals
    const activeBusyIntervals = (doctor.busyIntervals || []).filter(interval => {
      const iDate = new Date(interval.date);
      return iDate >= startOfDay && iDate <= endOfDay;
    });

    for (const interval of activeBusyIntervals) {
      const iStart = timeToMinutes(interval.startTime);
      const iEnd = timeToMinutes(interval.endTime);
      if (slotStartM < iEnd && slotEndM > iStart) {
        return res.status(400).json({
          success: false,
          message: `Doctor is unavailable during this time (${interval.startTime}-${interval.endTime}): ${interval.reason}`
        });
      }
    }

    // Atomic collision check on doctor: slot already booked?
    const existingDoctorBooking = await Appointment.findOne({
      doctorId,
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      timeSlot,
      status: { $nin: [APPOINTMENT_STATUS.CANCELLED, APPOINTMENT_STATUS.REJECTED] }
    });

    if (existingDoctorBooking) {
      return res.status(409).json({
        success: false,
        message: 'This time slot has already been booked. Please select another slot.'
      });
    }

    // Check patient conflict: does patient already have an appointment at this exact slot?
    const existingPatientBooking = await Appointment.findOne({
      patientId,
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      timeSlot,
      status: { $nin: [APPOINTMENT_STATUS.CANCELLED, APPOINTMENT_STATUS.REJECTED] }
    });

    if (existingPatientBooking) {
      return res.status(409).json({
        success: false,
        message: 'You already have another active appointment scheduled during this time slot.'
      });
    }

    // Create Appointment in requested status
    const appointment = new Appointment({
      patientId,
      doctorId,
      appointmentDate: apptDate,
      timeSlot,
      startTime: slotStartStr,
      endTime: slotEndStr,
      reason: reason || 'General Medical Consultation',
      fee: doctor.consultationFee,
      status: APPOINTMENT_STATUS.REQUESTED
    });

    // Initialize Healthcare Journey
    const journey = await HealthcareJourney.create({
      patientId,
      journeyType: 'doctor_consultation',
      title: `Consultation with Dr. ${doctor.userId?.name || 'Physician'} (${doctor.specialization})`,
      referenceType: 'Appointment',
      referenceId: appointment._id,
      currentStage: JOURNEY_STAGES.INITIATED,
      events: [
        {
          stage: JOURNEY_STAGES.INITIATED,
          title: 'Appointment Request Submitted',
          description: `Appointment requested for ${apptDate.toDateString()} at ${timeSlot}. Awaiting doctor confirmation.`,
          actorRole: 'patient',
          actorId: patientId,
          metadata: new Map([
            ['doctorName', doctor.userId?.name || 'Physician'],
            ['specialization', doctor.specialization],
            ['hospitalName', doctor.hospitalName || 'MediTrack Clinic'],
            ['fee', doctor.consultationFee.toString()]
          ])
        }
      ]
    });

    appointment.journeyId = journey._id;
    await appointment.save();

    // Send Notification to Doctor
    if (doctor.userId?._id) {
      await Notification.create({
        recipientId: doctor.userId._id,
        senderId: patientId,
        type: NOTIFICATION_TYPES.APPOINTMENT_REQUESTED,
        title: 'New Appointment Request',
        message: `${req.user.name} has requested an appointment on ${apptDate.toDateString()} at ${timeSlot}. Reason: ${reason || 'General Consultation'}`,
        relatedId: appointment._id
      });
    }

    res.status(201).json({
      success: true,
      message: 'Appointment request submitted successfully. Awaiting doctor confirmation.',
      data: {
        appointment,
        journeyId: journey._id
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getPatientAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find({ patientId: req.user._id })
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email phone' }
      })
      .populate('journeyId', 'currentStage isCompleted')
      .sort({ appointmentDate: -1, createdAt: -1 });

    res.status(200).json({ success: true, count: appointments.length, data: appointments });
  } catch (err) {
    next(err);
  }
};

export const getDoctorQueue = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    const { date, filter, status } = req.query;
    const query = { doctorId: doctor._id };

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    if (date) {
      const d = new Date(date);
      const startOfDay = new Date(d.setHours(0, 0, 0, 0));
      const endOfDay = new Date(d.setHours(23, 59, 59, 999));
      query.appointmentDate = { $gte: startOfDay, $lte: endOfDay };
    } else if (filter === 'today') {
      query.appointmentDate = { $gte: todayStart, $lte: todayEnd };
    } else if (filter === 'upcoming') {
      query.appointmentDate = { $gte: todayStart };
      query.status = { $in: [APPOINTMENT_STATUS.ACCEPTED, APPOINTMENT_STATUS.SCHEDULED, APPOINTMENT_STATUS.CONFIRMED, APPOINTMENT_STATUS.REQUESTED] };
    } else if (filter === 'pending') {
      query.status = APPOINTMENT_STATUS.REQUESTED;
    } else if (filter === 'accepted') {
      query.status = { $in: [APPOINTMENT_STATUS.ACCEPTED, APPOINTMENT_STATUS.SCHEDULED, APPOINTMENT_STATUS.CONFIRMED] };
    } else if (filter === 'completed') {
      query.status = APPOINTMENT_STATUS.COMPLETED;
    } else if (filter === 'cancelled') {
      query.status = { $in: [APPOINTMENT_STATUS.CANCELLED, APPOINTMENT_STATUS.REJECTED] };
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    const appointments = await Appointment.find(query)
      .populate('patientId', 'name email phone bloodGroup gender dateOfBirth address')
      .populate('journeyId', 'currentStage')
      .sort({ appointmentDate: 1, timeSlot: 1 });

    res.status(200).json({ success: true, count: appointments.length, data: appointments });
  } catch (err) {
    next(err);
  }
};

export const acceptAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const doctor = await Doctor.findOne({ userId: req.user._id }).populate('userId', 'name');
    if (!doctor) {
      return res.status(403).json({ success: false, message: 'Only authorized doctors can accept appointments.' });
    }

    const appointment = await Appointment.findById(id).populate('patientId', 'name email');
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    if (appointment.doctorId.toString() !== doctor._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden: You are not assigned to this appointment.' });
    }

    const wasAlreadyConfirmed = appointment.status === APPOINTMENT_STATUS.CONFIRMED;
    appointment.status = APPOINTMENT_STATUS.CONFIRMED;
    await appointment.save();

    // Update Journey
    if (appointment.journeyId) {
      await logJourneyEvent({
        journeyId: appointment.journeyId,
        stage: JOURNEY_STAGES.CONFIRMED,
        title: 'Appointment Accepted & Confirmed',
        description: `Dr. ${doctor.userId?.name} accepted your consultation request for ${new Date(appointment.appointmentDate).toDateString()} at ${appointment.timeSlot}.`,
        actorRole: 'doctor',
        actorId: req.user._id
      });
    }

    // Notify Patient
    await Notification.create({
      recipientId: appointment.patientId,
      senderId: req.user._id,
      type: NOTIFICATION_TYPES.APPOINTMENT_ACCEPTED,
      title: 'Appointment Confirmed',
      message: `Dr. ${doctor.userId?.name} has accepted your appointment on ${new Date(appointment.appointmentDate).toDateString()} at ${appointment.timeSlot}.`,
      relatedId: appointment._id
    });

    if (!wasAlreadyConfirmed) {
      await sendAppointmentConfirmationEmail({
        patientEmail: appointment.patientId.email,
        patientName: appointment.patientId.name,
        doctorName: doctor.userId?.name || 'Your doctor',
        appointmentDate: appointment.appointmentDate,
        timeSlot: appointment.timeSlot,
        fee: appointment.fee,
        appointmentId: appointment._id.toString()
      });
    }

    res.status(200).json({
      success: true,
      message: 'Appointment accepted successfully',
      data: appointment
    });
  } catch (err) {
    next(err);
  }
};

export const rejectAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const doctor = await Doctor.findOne({ userId: req.user._id }).populate('userId', 'name');
    if (!doctor) {
      return res.status(403).json({ success: false, message: 'Only authorized doctors can reject appointments.' });
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    if (appointment.doctorId.toString() !== doctor._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden: You are not assigned to this appointment.' });
    }

    appointment.status = APPOINTMENT_STATUS.REJECTED;
    appointment.rejectionReason = reason || 'Doctor unavailable at this time.';
    await appointment.save();

    // Update Journey
    if (appointment.journeyId) {
      await logJourneyEvent({
        journeyId: appointment.journeyId,
        stage: JOURNEY_STAGES.CANCELLED,
        title: 'Appointment Request Declined',
        description: `Dr. ${doctor.userId?.name} was unable to accept the appointment. Reason: ${appointment.rejectionReason}`,
        actorRole: 'doctor',
        actorId: req.user._id
      });
    }

    // Notify Patient
    await Notification.create({
      recipientId: appointment.patientId,
      senderId: req.user._id,
      type: NOTIFICATION_TYPES.APPOINTMENT_REJECTED,
      title: 'Appointment Request Declined',
      message: `Dr. ${doctor.userId?.name} declined your appointment request for ${new Date(appointment.appointmentDate).toDateString()}. Reason: ${appointment.rejectionReason}`,
      relatedId: appointment._id
    });

    res.status(200).json({
      success: true,
      message: 'Appointment rejected',
      data: appointment
    });
  } catch (err) {
    next(err);
  }
};

export const rescheduleAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newDate, newTimeSlot, reason } = req.body;

    if (!newDate || !newTimeSlot) {
      return res.status(400).json({ success: false, message: 'New date and new time slot are required.' });
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    // Check permissions
    const doctor = await Doctor.findOne({ userId: req.user._id }).populate('userId', 'name');
    const isAssignedDoctor = doctor && doctor._id.toString() === appointment.doctorId.toString();
    const isPatient = appointment.patientId.toString() === req.user._id.toString();

    if (!isAssignedDoctor && !isPatient && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Access denied to reschedule this appointment.' });
    }

    const apptDate = new Date(newDate);
    const startOfDay = new Date(apptDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(apptDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Collision check: Is new slot already booked by someone else?
    const existing = await Appointment.findOne({
      _id: { $ne: appointment._id },
      doctorId: appointment.doctorId,
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      timeSlot: newTimeSlot,
      status: { $nin: [APPOINTMENT_STATUS.CANCELLED, APPOINTMENT_STATUS.REJECTED] }
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'The requested new slot is already booked. Please choose another time.'
      });
    }

    // Record old slot info
    appointment.rescheduledFrom = {
      date: appointment.appointmentDate,
      timeSlot: appointment.timeSlot
    };

    const [startStr, endStr] = newTimeSlot.split('-');
    appointment.appointmentDate = apptDate;
    appointment.timeSlot = newTimeSlot;
    appointment.startTime = startStr;
    appointment.endTime = endStr;
    appointment.status = APPOINTMENT_STATUS.RESCHEDULED;
    await appointment.save();

    // Update Journey
    if (appointment.journeyId) {
      await logJourneyEvent({
        journeyId: appointment.journeyId,
        stage: JOURNEY_STAGES.CONFIRMED,
        title: 'Appointment Rescheduled',
        description: `Appointment moved to ${apptDate.toDateString()} at ${newTimeSlot}. Reason: ${reason || 'Rescheduled by provider'}`,
        actorRole: req.user.role,
        actorId: req.user._id
      });
    }

    // Notify other party
    const recipientId = isAssignedDoctor ? appointment.patientId : (doctor ? doctor.userId._id : null);
    if (recipientId) {
      await Notification.create({
        recipientId,
        senderId: req.user._id,
        type: NOTIFICATION_TYPES.APPOINTMENT_RESCHEDULED,
        title: 'Appointment Rescheduled',
        message: `Your appointment has been rescheduled to ${apptDate.toDateString()} at ${newTimeSlot}. Reason: ${reason || 'Schedule update'}`,
        relatedId: appointment._id
      });
    }

    res.status(200).json({
      success: true,
      message: 'Appointment rescheduled successfully',
      data: appointment
    });
  } catch (err) {
    next(err);
  }
};

export const cancelAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { cancellationReason } = req.body;

    const appointment = await Appointment.findById(id).populate({
      path: 'doctorId',
      populate: { path: 'userId', select: 'name' }
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    const isPatient = appointment.patientId.toString() === req.user._id.toString();
    const doctor = await Doctor.findOne({ userId: req.user._id });
    const isDoctor = doctor && appointment.doctorId._id.toString() === doctor._id.toString();

    if (!isPatient && !isDoctor && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Access denied to cancel this appointment.' });
    }

    appointment.status = APPOINTMENT_STATUS.CANCELLED;
    appointment.cancellationReason = cancellationReason || 'Cancelled by user';
    await appointment.save();

    // Update Journey
    if (appointment.journeyId) {
      await logJourneyEvent({
        journeyId: appointment.journeyId,
        stage: JOURNEY_STAGES.CANCELLED,
        title: 'Appointment Cancelled',
        description: `Appointment was cancelled by ${req.user.name}. Reason: ${appointment.cancellationReason}`,
        actorRole: req.user.role,
        actorId: req.user._id
      });
    }

    // Notify counterpart
    const notifyId = isPatient ? appointment.doctorId?.userId?._id : appointment.patientId;
    if (notifyId) {
      await Notification.create({
        recipientId: notifyId,
        senderId: req.user._id,
        type: NOTIFICATION_TYPES.APPOINTMENT_CANCELLED,
        title: 'Appointment Cancelled',
        message: `Appointment for ${new Date(appointment.appointmentDate).toDateString()} at ${appointment.timeSlot} was cancelled. Reason: ${appointment.cancellationReason}`,
        relatedId: appointment._id
      });
    }

    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: appointment
    });
  } catch (err) {
    next(err);
  }
};

export const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    appointment.status = status;
    await appointment.save();

    // Map status to Journey stage
    let journeyStage = JOURNEY_STAGES.IN_PROGRESS;
    let description = `Appointment status moved to ${status}`;

    if (status === APPOINTMENT_STATUS.IN_CONSULTATION) {
      journeyStage = JOURNEY_STAGES.IN_PROGRESS;
      description = 'Doctor has initiated the clinical consultation.';
    } else if (status === APPOINTMENT_STATUS.COMPLETED) {
      journeyStage = JOURNEY_STAGES.COMPLETED;
      description = 'Consultation concluded. Prescription and clinical advice recorded.';
    } else if (status === APPOINTMENT_STATUS.CANCELLED) {
      journeyStage = JOURNEY_STAGES.CANCELLED;
      description = 'Appointment was cancelled.';
    }

    if (appointment.journeyId) {
      await logJourneyEvent({
        journeyId: appointment.journeyId,
        stage: journeyStage,
        title: `Consultation ${status.replace('_', ' ').toUpperCase()}`,
        description,
        actorRole: req.user.role,
        actorId: req.user._id
      });
    }

    res.status(200).json({ success: true, message: 'Appointment status updated', data: appointment });
  } catch (err) {
    next(err);
  }
};

export const addConsultationNotes = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { consultationNotes, prescription, prescribedTests } = req.body;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (consultationNotes !== undefined) appointment.consultationNotes = consultationNotes;
    if (prescription) appointment.prescription = prescription;
    if (prescribedTests) appointment.prescribedTests = prescribedTests;
    appointment.status = APPOINTMENT_STATUS.COMPLETED;

    await appointment.save();

    if (appointment.journeyId) {
      await logJourneyEvent({
        journeyId: appointment.journeyId,
        stage: JOURNEY_STAGES.COMPLETED,
        title: 'Prescription & Consultation Completed',
        description: 'Doctor completed clinical assessment and issued digital prescription.',
        actorRole: 'doctor',
        actorId: req.user._id,
        metadata: {
          prescriptionCount: String(prescription?.length || 0),
          testsOrdered: String(prescribedTests?.length || 0)
        }
      });
    }

    // Notify patient
    await Notification.create({
      recipientId: appointment.patientId,
      senderId: req.user._id,
      type: NOTIFICATION_TYPES.APPOINTMENT_COMPLETED,
      title: 'Consultation Completed',
      message: 'Your doctor has completed your consultation and issued digital prescription and notes.',
      relatedId: appointment._id
    });

    res.status(200).json({
      success: true,
      message: 'Consultation notes saved and marked completed',
      data: appointment
    });
  } catch (err) {
    next(err);
  }
};

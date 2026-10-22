import { Payment } from '../models/Payment.js';
import { Appointment } from '../models/Appointment.js';
import { TestBooking } from '../models/TestBooking.js';
import { logJourneyEvent } from '../utils/journeyDispatcher.js';
import { sendAppointmentConfirmationEmail } from '../services/emailService.js';
import { PAYMENT_STATUS, APPOINTMENT_STATUS, TEST_BOOKING_STATUS, JOURNEY_STAGES } from '../config/constants.js';

export const processMockPayment = async (req, res, next) => {
  try {
    const { referenceType, referenceId, paymentMethod, simulateResult = 'SUCCESS' } = req.body;
    const patientId = req.user._id;

    if (!['Appointment', 'TestBooking'].includes(referenceType)) {
      return res.status(400).json({ success: false, message: 'Invalid referenceType. Must be Appointment or TestBooking' });
    }

    let booking;
    let amount = 0;
    let description = '';

    if (referenceType === 'Appointment') {
      booking = await Appointment.findById(referenceId).populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name' }
      }).populate('patientId', 'name email');
      if (!booking) return res.status(404).json({ success: false, message: 'Appointment record not found' });
      amount = booking.fee;
      description = `Doctor Consultation - Dr. ${booking.doctorId?.userId?.name || 'Physician'}`;
    } else {
      booking = await TestBooking.findById(referenceId).populate('testId');
      if (!booking) return res.status(404).json({ success: false, message: 'Test booking record not found' });
      amount = booking.amount;
      description = `Diagnostic Test - ${booking.testId?.testName || 'Laboratory'}`;
    }

    const uniqueId = `${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const transactionId = `TRX-${uniqueId}`;

    // Handle Simulated Failure scenario
    if (simulateResult === 'FAIL') {
      const failedPayment = await Payment.create({
        patientId,
        referenceType,
        referenceId,
        amount,
        currency: 'INR',
        transactionId,
        paymentMethod: paymentMethod || 'mock_card',
        paymentStatus: PAYMENT_STATUS.FAILED,
        gatewayResponse: {
          simulationCode: 'ERR_SIMULATED_DECLINE',
          receiptNumber: `FAIL-${uniqueId}`,
          authCode: 'NONE'
        }
      });

      return res.status(402).json({
        success: false,
        message: 'Mock Payment Failed: Simulated bank transaction decline or insufficient funds.',
        data: failedPayment
      });
    }

    // Handle Simulated Success scenario
    const successfulPayment = await Payment.create({
      patientId,
      referenceType,
      referenceId,
      amount,
      currency: 'INR',
      transactionId,
      paymentMethod: paymentMethod || 'mock_card',
      paymentStatus: PAYMENT_STATUS.SUCCESSFUL,
      gatewayResponse: {
        simulationCode: 'SIM_AUTH_OK',
        receiptNumber: `REC-${uniqueId}`,
        authCode: `AUTH-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
      },
      paidAt: new Date()
    });

    // Update target booking status to confirmed
    if (referenceType === 'Appointment') {
      booking.status = APPOINTMENT_STATUS.CONFIRMED;
    } else {
      booking.status = TEST_BOOKING_STATUS.CONFIRMED;
    }
    await booking.save();

    if (referenceType === 'Appointment') {
      await sendAppointmentConfirmationEmail({
        patientEmail: booking.patientId.email,
        patientName: booking.patientId.name,
        doctorName: booking.doctorId?.userId?.name || 'Your doctor',
        appointmentDate: booking.appointmentDate,
        timeSlot: booking.timeSlot,
        fee: booking.fee,
        appointmentId: booking._id.toString()
      });
    }

    // Advance Journey and append timeline event
    if (booking.journeyId) {
      await logJourneyEvent({
        journeyId: booking.journeyId,
        stage: JOURNEY_STAGES.CONFIRMED,
        title: 'Payment Received & Schedule Confirmed',
        description: `Online payment of ₹${amount} received via ${paymentMethod || 'Mock Gateway'}. Transaction ID: ${transactionId}. Booking officially confirmed.`,
        actorRole: 'patient',
        actorId: patientId,
        metadata: {
          transactionId,
          receiptNumber: successfulPayment.gatewayResponse.receiptNumber,
          amount: String(amount),
          paymentMethod: paymentMethod || 'mock_card'
        }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment completed successfully. Booking has been confirmed.',
      data: {
        payment: successfulPayment,
        booking
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getPaymentReceipt = async (req, res, next) => {
  try {
    const payment = await Payment.findOne({
      transactionId: req.params.transactionId
    }).populate('patientId', 'name email phone');

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    res.status(200).json({ success: true, data: payment });
  } catch (err) {
    next(err);
  }
};

export const getAllPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find()
      .populate('patientId', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: payments.length, data: payments });
  } catch (err) {
    next(err);
  }
};

import { TestBooking } from '../models/TestBooking.js';
import { DiagnosticTest } from '../models/DiagnosticTest.js';
import { HealthcareJourney } from '../models/HealthcareJourney.js';
import { logJourneyEvent } from '../utils/journeyDispatcher.js';
import { TEST_BOOKING_STATUS, JOURNEY_STAGES } from '../config/constants.js';

export const createTestBooking = async (req, res, next) => {
  try {
    const { testId, bookingDate, timeSlot, collectionType, collectionAddress } = req.body;
    const patientId = req.user._id;

    const test = await DiagnosticTest.findById(testId);
    if (!test || !test.isActive) {
      return res.status(404).json({ success: false, message: 'Diagnostic test not found or unavailable' });
    }

    const booking = new TestBooking({
      patientId,
      testId,
      bookingDate: new Date(bookingDate),
      timeSlot,
      collectionType: collectionType || 'lab_visit',
      collectionAddress: collectionAddress || {},
      amount: test.price,
      status: TEST_BOOKING_STATUS.PENDING_PAYMENT
    });

    // Create corresponding Healthcare Journey
    const journey = await HealthcareJourney.create({
      patientId,
      journeyType: 'diagnostic_investigation',
      title: `Diagnostic Investigation: ${test.testName} (${test.testCode})`,
      referenceType: 'TestBooking',
      referenceId: booking._id,
      currentStage: JOURNEY_STAGES.PAYMENT_PENDING,
      events: [
        {
          stage: JOURNEY_STAGES.INITIATED,
          title: 'Diagnostic Test Booked',
          description: `${test.testName} booked for ${new Date(bookingDate).toDateString()} (${timeSlot}). Mode: ${collectionType === 'home_collection' ? 'Home Sample Collection' : 'Hospital Laboratory Visit'}.`,
          actorRole: 'patient',
          actorId: patientId,
          metadata: new Map([
            ['testName', test.testName],
            ['testCode', test.testCode],
            ['collectionType', collectionType || 'lab_visit'],
            ['price', test.price.toString()]
          ])
        }
      ]
    });

    booking.journeyId = journey._id;
    await booking.save();

    res.status(201).json({
      success: true,
      message: 'Test booking created. Proceed to payment to confirm schedule.',
      data: {
        booking,
        journeyId: journey._id
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getPatientBookings = async (req, res, next) => {
  try {
    const bookings = await TestBooking.find({ patientId: req.user._id })
      .populate('testId')
      .populate('journeyId', 'currentStage isCompleted')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    next(err);
  }
};

export const getAllBookings = async (req, res, next) => {
  try {
    const { status, collectionType } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (collectionType) filter.collectionType = collectionType;

    const bookings = await TestBooking.find(filter)
      .populate('patientId', 'name email phone bloodGroup address')
      .populate('testId')
      .populate('journeyId', 'currentStage')
      .sort({ bookingDate: -1 });

    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    next(err);
  }
};

export const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const booking = await TestBooking.findById(id).populate('testId');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Test booking not found' });
    }

    booking.status = status;
    await booking.save();

    let journeyStage = JOURNEY_STAGES.IN_PROGRESS;
    let description = `Diagnostic workflow updated to ${status}`;

    if (status === TEST_BOOKING_STATUS.SAMPLE_COLLECTED) {
      journeyStage = JOURNEY_STAGES.SAMPLE_COLLECTED;
      description = `Biological sample (${booking.testId?.sampleType || 'Specimen'}) collected successfully. Transferred to lab.`;
    } else if (status === TEST_BOOKING_STATUS.PROCESSING) {
      journeyStage = JOURNEY_STAGES.IN_PROGRESS;
      description = 'Lab analyzer is processing the specimen under clinical supervision.';
    } else if (status === TEST_BOOKING_STATUS.COMPLETED) {
      journeyStage = JOURNEY_STAGES.REPORT_READY;
      description = 'Diagnostic analysis completed. Digital report generated.';
    }

    if (booking.journeyId) {
      await logJourneyEvent({
        journeyId: booking.journeyId,
        stage: journeyStage,
        title: `Test Status: ${status.replace('_', ' ').toUpperCase()}`,
        description,
        actorRole: req.user.role,
        actorId: req.user._id
      });
    }

    res.status(200).json({
      success: true,
      message: 'Booking status updated successfully',
      data: booking
    });
  } catch (err) {
    next(err);
  }
};

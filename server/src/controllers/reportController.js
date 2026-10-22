import path from 'path';
import fs from 'fs';
import { Report } from '../models/Report.js';
import { TestBooking } from '../models/TestBooking.js';
import { logJourneyEvent } from '../utils/journeyDispatcher.js';
import { sendLabReportEmail } from '../services/emailService.js';
import { REPORT_STATUS, TEST_BOOKING_STATUS, JOURNEY_STAGES } from '../config/constants.js';

export const uploadReport = async (req, res, next) => {
  try {
    const { testBookingId, clinicalRemarks } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please provide a valid PDF or image report file' });
    }

    const booking = await TestBooking.findById(testBookingId)
      .populate('testId')
      .populate('patientId', 'name email');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Associated test booking record not found' });
    }

    const existingReport = await Report.findOne({ testBookingId });
    if (existingReport) {
      return res.status(409).json({ success: false, message: 'A report has already been uploaded for this test booking' });
    }

    const report = await Report.create({
      patientId: booking.patientId,
      testBookingId: booking._id,
      testName: booking.testId?.testName || 'Diagnostic Test',
      uploadedBy: req.user._id,
      fileUrl: `/uploads/reports/${req.file.filename}`,
      originalFileName: req.file.originalname,
      fileMimeType: req.file.mimetype,
      fileSizeBytes: req.file.size,
      clinicalRemarks: clinicalRemarks || 'Diagnostic evaluation completed. Report verified by laboratory.',
      status: REPORT_STATUS.PUBLISHED,
      journeyId: booking.journeyId
    });

    // Advance booking status
    booking.status = TEST_BOOKING_STATUS.COMPLETED;
    await booking.save();

    // Advance Healthcare Journey
    if (booking.journeyId) {
      await logJourneyEvent({
        journeyId: booking.journeyId,
        stage: JOURNEY_STAGES.REPORT_READY,
        title: 'Diagnostic Report Ready for Download',
        description: `Verified medical report for ${booking.testId?.testName} has been published by lab staff. Available for online review.`,
        actorRole: 'admin',
        actorId: req.user._id,
        metadata: {
          reportId: report._id.toString(),
          fileName: req.file.originalname,
          remarks: clinicalRemarks || ''
        }
      });
    }

    await sendLabReportEmail({
      patientEmail: booking.patientId.email,
      patientName: booking.patientId.name,
      testName: report.testName,
      clinicalRemarks: report.clinicalRemarks,
      fileUrl: report.fileUrl,
      reportId: report._id.toString()
    });

    res.status(201).json({
      success: true,
      message: 'Report uploaded and published to patient portal successfully',
      data: report
    });
  } catch (err) {
    next(err);
  }
};

export const getReportByBookingId = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const report = await Report.findOne({ testBookingId: bookingId }).populate('uploadedBy', 'name');

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report has not yet been published for this test' });
    }

    // Role check: Only admin, assigned doctor, or the patient who owns it
    if (req.user.role === 'patient' && report.patientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden: Access denied to foreign report' });
    }

    res.status(200).json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
};

export const getPatientReports = async (req, res, next) => {
  try {
    const reports = await Report.find({ patientId: req.user._id })
      .populate('testBookingId')
      .populate('uploadedBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: reports.length, data: reports });
  } catch (err) {
    next(err);
  }
};

export const downloadReportFile = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report record not found' });
    }

    // Authorization guard
    if (req.user.role === 'patient' && report.patientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden: You are not authorized to view this report' });
    }

    const filePath = path.resolve('.' + report.fileUrl);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Report file missing on server storage' });
    }

    // If first time viewed by patient, update status & journey
    if (req.user.role === 'patient' && report.status !== REPORT_STATUS.VIEWED) {
      report.status = REPORT_STATUS.VIEWED;
      report.firstViewedAt = new Date();
      await report.save();

      if (report.journeyId) {
        await logJourneyEvent({
          journeyId: report.journeyId,
          stage: JOURNEY_STAGES.COMPLETED,
          title: 'Report Viewed by Patient',
          description: 'Patient accessed and downloaded digital diagnostic report. Healthcare journey completed.',
          actorRole: 'patient',
          actorId: req.user._id
        });
      }
    }

    res.setHeader('Content-Type', report.fileMimeType);
    res.setHeader('Content-Disposition', `inline; filename="${report.originalFileName}"`);
    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    next(err);
  }
};

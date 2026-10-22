import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';

const getTransporter = () => {
  const mailConfigured = [
    process.env.MAIL_HOST,
    process.env.MAIL_USER,
    process.env.MAIL_PASSWORD,
    process.env.MAIL_FROM
  ].every(Boolean);

  if (!mailConfigured) return null;

  return nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT || 587),
      secure: process.env.MAIL_SECURE === 'true',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD
      }
    })
};

const sendEmail = async ({ to, subject, text, html, attachments = [] }) => {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn('[Email]: SMTP is not configured. Email notification skipped.');
    return false;
  }

  try {
    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to,
      subject,
      text,
      html,
      attachments
    });
    console.log(`[Email]: Notification sent to ${to}`);
    return true;
  } catch (err) {
    console.error(`[Email]: Notification failed for ${to}: ${err.message}`);
    return false;
  }
};

export const sendAppointmentConfirmationEmail = async ({
  patientEmail,
  patientName,
  doctorName,
  appointmentDate,
  timeSlot,
  fee,
  appointmentId
}) => {
  const dateText = new Date(appointmentDate).toDateString();
  return sendEmail({
    to: patientEmail,
    subject: 'MediTrack appointment confirmed',
    text: `Hello ${patientName},\n\n${doctorName} confirmed your MediTrack appointment on ${dateText} at ${timeSlot}. Consultation fee: INR ${fee}.\nAppointment ID: ${appointmentId}\n\nPlease arrive a few minutes early.`,
    html: `<p>Hello ${patientName},</p><p><strong>${doctorName}</strong> confirmed your MediTrack appointment.</p><p><strong>Date:</strong> ${dateText}<br><strong>Time:</strong> ${timeSlot}<br><strong>Fee:</strong> INR ${fee}<br><strong>Appointment ID:</strong> ${appointmentId}</p><p>Please arrive a few minutes early.</p>`
  });
};

export const sendLabReportEmail = async ({
  patientEmail,
  patientName,
  testName,
  clinicalRemarks,
  fileUrl,
  reportId
}) => {
  const reportPath = path.resolve('.' + fileUrl);
  const attachments = fs.existsSync(reportPath)
    ? [{ filename: path.basename(reportPath), path: reportPath }]
    : [];

  return sendEmail({
    to: patientEmail,
    subject: `MediTrack lab report ready: ${testName}`,
    text: `Hello ${patientName},\n\nYour ${testName} report is now available in the MediTrack patient portal.${clinicalRemarks ? `\n\nRemarks: ${clinicalRemarks}` : ''}\nReport ID: ${reportId}\n\nThe report is attached to this email when available.`,
    html: `<p>Hello ${patientName},</p><p>Your <strong>${testName}</strong> report is now available in the MediTrack patient portal.</p>${clinicalRemarks ? `<p><strong>Remarks:</strong> ${clinicalRemarks}</p>` : ''}<p><strong>Report ID:</strong> ${reportId}</p><p>The report is attached to this email when available.</p>`,
    attachments
  });
};

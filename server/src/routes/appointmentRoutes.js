import express from 'express';
import { 
  createAppointment, 
  getPatientAppointments, 
  getDoctorQueue, 
  acceptAppointment,
  rejectAppointment,
  rescheduleAppointment,
  cancelAppointment,
  updateAppointmentStatus, 
  addConsultationNotes 
} from '../controllers/appointmentController.js';
import { verifyToken } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/roleCheck.js';

const router = express.Router();

router.post('/', verifyToken, authorizeRoles('patient'), createAppointment);
router.get('/my', verifyToken, authorizeRoles('patient'), getPatientAppointments);
router.get('/doctor-queue', verifyToken, authorizeRoles('doctor'), getDoctorQueue);
router.get('/doctor/appointments', verifyToken, authorizeRoles('doctor'), getDoctorQueue);

router.put('/:id/accept', verifyToken, authorizeRoles('doctor'), acceptAppointment);
router.put('/:id/reject', verifyToken, authorizeRoles('doctor'), rejectAppointment);
router.put('/:id/reschedule', verifyToken, authorizeRoles('doctor', 'patient', 'admin'), rescheduleAppointment);
router.put('/:id/cancel', verifyToken, authorizeRoles('doctor', 'patient', 'admin'), cancelAppointment);
router.put('/:id/complete', verifyToken, authorizeRoles('doctor'), addConsultationNotes);
router.put('/:id/status', verifyToken, authorizeRoles('doctor', 'admin'), updateAppointmentStatus);
router.post('/:id/notes', verifyToken, authorizeRoles('doctor'), addConsultationNotes);
router.post('/:id/consultation-notes', verifyToken, authorizeRoles('doctor'), addConsultationNotes);
router.put('/:id/consultation-notes', verifyToken, authorizeRoles('doctor'), addConsultationNotes);

export default router;

import express from 'express';
import { 
  getAllDoctors, 
  getDoctorById, 
  getDoctorSlots, 
  getDoctorAvailability,
  getMyDoctorProfile,
  updateDoctorProfile,
  updateSchedule,
  updateAvailabilityStatus
} from '../controllers/doctorController.js';
import { verifyToken } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/roleCheck.js';

const router = express.Router();

router.get('/', getAllDoctors);
router.get('/profile/me', verifyToken, authorizeRoles('doctor'), getMyDoctorProfile);
router.put('/profile', verifyToken, authorizeRoles('doctor'), updateDoctorProfile);
router.put('/availability', verifyToken, authorizeRoles('doctor'), updateSchedule);
router.put('/schedule/my', verifyToken, authorizeRoles('doctor'), updateSchedule);
router.put('/status', verifyToken, authorizeRoles('doctor'), updateAvailabilityStatus);

router.get('/:id', getDoctorById);
router.get('/:id/slots', getDoctorSlots);
router.get('/:id/availability', getDoctorAvailability);

export default router;

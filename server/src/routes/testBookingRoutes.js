import express from 'express';
import { 
  createTestBooking, 
  getPatientBookings, 
  getAllBookings, 
  updateBookingStatus 
} from '../controllers/testBookingController.js';
import { verifyToken } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/roleCheck.js';

const router = express.Router();

router.post('/', verifyToken, authorizeRoles('patient'), createTestBooking);
router.get('/my', verifyToken, authorizeRoles('patient'), getPatientBookings);
router.get('/', verifyToken, authorizeRoles('admin'), getAllBookings);
router.put('/:id/status', verifyToken, authorizeRoles('admin'), updateBookingStatus);

export default router;

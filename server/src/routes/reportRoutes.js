import express from 'express';
import { 
  uploadReport, 
  getReportByBookingId, 
  getPatientReports, 
  downloadReportFile 
} from '../controllers/reportController.js';
import { verifyToken } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/roleCheck.js';
import { uploadReportMiddleware } from '../middleware/upload.js';

const router = express.Router();

router.post('/upload', verifyToken, authorizeRoles('admin'), uploadReportMiddleware.single('reportFile'), uploadReport);
router.get('/my', verifyToken, authorizeRoles('patient'), getPatientReports);
router.get('/booking/:bookingId', verifyToken, getReportByBookingId);
router.get('/download/:id', verifyToken, downloadReportFile);

export default router;

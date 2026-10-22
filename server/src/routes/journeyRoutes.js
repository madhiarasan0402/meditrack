import express from 'express';
import { 
  getPatientJourneys, 
  getJourneyById, 
  getActiveJourneySummary, 
  addManualEvent 
} from '../controllers/journeyController.js';
import { verifyToken } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/roleCheck.js';

const router = express.Router();

router.get('/my', verifyToken, authorizeRoles('patient'), getPatientJourneys);
router.get('/active-summary', verifyToken, authorizeRoles('patient'), getActiveJourneySummary);
router.get('/:id', verifyToken, getJourneyById);
router.post('/:id/event', verifyToken, authorizeRoles('admin', 'doctor'), addManualEvent);

export default router;

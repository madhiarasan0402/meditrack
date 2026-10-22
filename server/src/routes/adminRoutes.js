import express from 'express';
import { 
  getSystemMetrics, 
  getAllUsers, 
  updateUserStatus, 
  seedDatabaseHandler 
} from '../controllers/adminController.js';
import { verifyToken } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/roleCheck.js';

const router = express.Router();

router.get('/metrics', verifyToken, authorizeRoles('admin'), getSystemMetrics);
router.get('/users', verifyToken, authorizeRoles('admin'), getAllUsers);
router.put('/users/:id/status', verifyToken, authorizeRoles('admin'), updateUserStatus);
router.post('/seed-data', verifyToken, authorizeRoles('admin'), seedDatabaseHandler);

export default router;

import express from 'express';
import { 
  getAllTests, 
  getTestById, 
  createTest, 
  updateTest, 
  deleteTest 
} from '../controllers/diagnosticController.js';
import { verifyToken } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/roleCheck.js';

const router = express.Router();

router.get('/', getAllTests);
router.get('/:id', getTestById);
router.post('/', verifyToken, authorizeRoles('admin'), createTest);
router.put('/:id', verifyToken, authorizeRoles('admin'), updateTest);
router.delete('/:id', verifyToken, authorizeRoles('admin'), deleteTest);

export default router;

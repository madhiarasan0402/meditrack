import express from 'express';
import { 
  processMockPayment, 
  getPaymentReceipt, 
  getAllPayments 
} from '../controllers/paymentController.js';
import { verifyToken } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/roleCheck.js';

const router = express.Router();

router.post('/mock-checkout', verifyToken, authorizeRoles('patient'), processMockPayment);
router.get('/receipt/:transactionId', verifyToken, getPaymentReceipt);
router.get('/', verifyToken, authorizeRoles('admin'), getAllPayments);

export default router;

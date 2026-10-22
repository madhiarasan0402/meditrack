import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access Denied: Missing authorization token'
      });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'meditrack_jwt_secret_dev_key_2026';
    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session: User record no longer exists'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account deactivated. Please contact platform administration.'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Token expired or invalid signature'
    });
  }
};

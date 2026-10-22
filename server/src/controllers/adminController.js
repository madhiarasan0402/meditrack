import { User } from '../models/User.js';
import { Doctor } from '../models/Doctor.js';
import { Appointment } from '../models/Appointment.js';
import { TestBooking } from '../models/TestBooking.js';
import { Payment } from '../models/Payment.js';
import { Report } from '../models/Report.js';
import { HealthcareJourney } from '../models/HealthcareJourney.js';
import { seedDatabase } from '../utils/seedData.js';

export const getSystemMetrics = async (req, res, next) => {
  try {
    const [
      totalPatients,
      totalDoctors,
      totalAppointments,
      totalTestBookings,
      payments,
      pendingReportsCount,
      activeJourneysCount
    ] = await Promise.all([
      User.countDocuments({ role: 'patient' }),
      Doctor.countDocuments({ isAvailable: true }),
      Appointment.countDocuments(),
      TestBooking.countDocuments(),
      Payment.find({ paymentStatus: 'successful' }).select('amount'),
      TestBooking.countDocuments({ status: { $in: ['sample_collected', 'processing'] } }),
      HealthcareJourney.countDocuments({ isCompleted: false })
    ]);

    const totalRevenue = payments.reduce((acc, curr) => acc + (curr.amount || 0), 0);

    res.status(200).json({
      success: true,
      data: {
        totalPatients,
        totalDoctors,
        totalAppointments,
        totalTestBookings,
        totalRevenue,
        pendingReportsCount,
        activeJourneysCount
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const { role } = req.query;
    const filter = {};
    if (role && role !== 'all') {
      filter.role = role;
    }

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (err) {
    next(err);
  }
};

export const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(id, { isActive }, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, message: 'User status updated', data: user });
  } catch (err) {
    next(err);
  }
};

export const seedDatabaseHandler = async (req, res, next) => {
  try {
    const result = await seedDatabase();
    res.status(200).json({ success: true, message: 'Database seeded successfully', data: result });
  } catch (err) {
    next(err);
  }
};

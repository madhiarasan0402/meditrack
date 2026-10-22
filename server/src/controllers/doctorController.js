import { Doctor } from '../models/Doctor.js';
import { Appointment } from '../models/Appointment.js';
import { User } from '../models/User.js';
import { DOCTOR_AVAILABILITY_STATUS } from '../config/constants.js';

// Helper to convert "HH:mm" to minutes from midnight
const timeToMinutes = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

// Helper to convert minutes from midnight to "HH:mm"
const minutesToTime = (minutes) => {
  const h = String(Math.floor(minutes / 60)).padStart(2, '0');
  const m = String(minutes % 60).padStart(2, '0');
  return `${h}:${m}`;
};

export const getAllDoctors = async (req, res, next) => {
  try {
    const { specialization, search, status } = req.query;
    const filter = { isAvailable: true };

    if (specialization && specialization !== 'All') {
      filter.specialization = new RegExp(`^${specialization}$`, 'i');
    }

    if (status && status !== 'All') {
      filter.availabilityStatus = status;
    }

    let doctors = await Doctor.find(filter).populate('userId', 'name email phone gender');

    if (search) {
      const searchLower = search.toLowerCase();
      doctors = doctors.filter(doc => 
        doc.userId?.name?.toLowerCase().includes(searchLower) ||
        doc.specialization?.toLowerCase().includes(searchLower) ||
        doc.hospitalName?.toLowerCase().includes(searchLower) ||
        doc.medicalLicenseNumber?.toLowerCase().includes(searchLower)
      );
    }

    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors
    });
  } catch (err) {
    next(err);
  }
};

export const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('userId', 'name email phone gender dateOfBirth');
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }
    res.status(200).json({ success: true, data: doctor });
  } catch (err) {
    next(err);
  }
};

export const getMyDoctorProfile = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id }).populate('userId', 'name email phone gender dateOfBirth');
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found for this account' });
    }
    res.status(200).json({ success: true, data: doctor });
  } catch (err) {
    next(err);
  }
};

export const getDoctorSlots = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date } = req.query; // YYYY-MM-DD

    if (!date) {
      return res.status(400).json({ success: false, message: 'Date parameter (YYYY-MM-DD) is required' });
    }

    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    // 1. Overall Status Check (Busy / On Leave / Unavailable)
    if (doctor.availabilityStatus && doctor.availabilityStatus !== DOCTOR_AVAILABILITY_STATUS.AVAILABLE) {
      const statusLabels = {
        [DOCTOR_AVAILABILITY_STATUS.BUSY]: 'Doctor is currently Busy with procedures/emergencies.',
        [DOCTOR_AVAILABILITY_STATUS.ON_LEAVE]: 'Doctor is currently On Leave.',
        [DOCTOR_AVAILABILITY_STATUS.UNAVAILABLE]: 'Doctor is currently Unavailable for consultations.'
      };

      return res.status(200).json({
        success: true,
        isDoctorAvailable: false,
        doctorStatus: doctor.availabilityStatus,
        message: statusLabels[doctor.availabilityStatus] || 'Doctor is currently unavailable. Please select another date or doctor.',
        data: []
      });
    }

    // 2. Determine Day of Week
    const targetDate = new Date(date);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const targetDayName = dayNames[targetDate.getDay()];

    if (!doctor.availableDays.includes(targetDayName)) {
      return res.status(200).json({
        success: true,
        isDoctorAvailable: false,
        doctorStatus: doctor.availabilityStatus,
        message: `Doctor does not consult on ${targetDayName}s`,
        data: []
      });
    }

    // 3. Compute Working and Break Bounds
    const startM = timeToMinutes(doctor.workingHours?.start || '09:00');
    const endM = timeToMinutes(doctor.workingHours?.end || '17:00');
    const breakStartM = timeToMinutes(doctor.breakTime?.start || '13:00');
    const breakEndM = timeToMinutes(doctor.breakTime?.end || '14:00');
    const slotDuration = doctor.slotDurationMinutes || 30;

    // 4. Check for Specific Busy Intervals for target date
    const targetDateMidnight = new Date(targetDate);
    targetDateMidnight.setHours(0, 0, 0, 0);
    const targetDateEnd = new Date(targetDate);
    targetDateEnd.setHours(23, 59, 59, 999);

    const activeBusyIntervals = (doctor.busyIntervals || []).filter(interval => {
      const iDate = new Date(interval.date);
      return iDate >= targetDateMidnight && iDate <= targetDateEnd;
    });

    // 5. Generate all candidate slots
    const allSlots = [];
    for (let m = startM; m + slotDuration <= endM; m += slotDuration) {
      const slotStart = m;
      const slotEnd = m + slotDuration;

      // Check if slot falls in break time
      const isBreak = (slotStart < breakEndM && slotEnd > breakStartM);

      // Check if slot falls in doctor's custom busy intervals
      let isBusyInterval = false;
      let busyReason = '';

      for (const interval of activeBusyIntervals) {
        const iStart = timeToMinutes(interval.startTime);
        const iEnd = timeToMinutes(interval.endTime);
        if (slotStart < iEnd && slotEnd > iStart) {
          isBusyInterval = true;
          busyReason = interval.reason || 'Doctor has marked this period busy';
          break;
        }
      }

      const slotStr = `${minutesToTime(slotStart)}-${minutesToTime(slotEnd)}`;
      allSlots.push({
        slot: slotStr,
        startTime: minutesToTime(slotStart),
        endTime: minutesToTime(slotEnd),
        isBreak,
        isBusyInterval,
        busyReason
      });
    }

    // 6. Find already booked active appointments for that date (excluding cancelled & rejected)
    const bookedAppointments = await Appointment.find({
      doctorId: id,
      appointmentDate: { $gte: targetDateMidnight, $lte: targetDateEnd },
      status: { $nin: ['cancelled', 'rejected'] }
    }).select('timeSlot status');

    const bookedSlotSet = new Set(bookedAppointments.map(a => a.timeSlot));

    // 7. Formulate Slot Availability List
    const slotAvailability = allSlots.map(item => {
      const isBooked = bookedSlotSet.has(item.slot);
      const isAvailable = !isBooked && !item.isBreak && !item.isBusyInterval;
      
      let reasonIfUnavailable = '';
      if (isBooked) reasonIfUnavailable = 'Already booked';
      else if (item.isBreak) reasonIfUnavailable = 'Doctor Lunch/Break time';
      else if (item.isBusyInterval) reasonIfUnavailable = item.busyReason;

      return {
        slot: item.slot,
        startTime: item.startTime,
        endTime: item.endTime,
        isBooked,
        isBreak: item.isBreak,
        isBusy: item.isBusyInterval,
        isAvailable,
        reasonIfUnavailable
      };
    });

    res.status(200).json({
      success: true,
      isDoctorAvailable: true,
      doctorStatus: doctor.availabilityStatus,
      data: slotAvailability
    });
  } catch (err) {
    next(err);
  }
};

export const getDoctorAvailability = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id).select(
      'availableDays workingHours breakTime slotDurationMinutes availabilityStatus busyIntervals roomNumber'
    );
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    res.status(200).json({ success: true, data: doctor });
  } catch (err) {
    next(err);
  }
};

export const updateDoctorProfile = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    const {
      specialization,
      qualifications,
      experienceYears,
      hospitalName,
      consultationFee,
      roomNumber,
      bio,
      profilePhoto,
      phone,
      address,
      medicalLicenseNumber
    } = req.body;

    if (specialization) doctor.specialization = specialization;
    if (qualifications) doctor.qualifications = Array.isArray(qualifications) ? qualifications : [qualifications];
    if (experienceYears !== undefined) doctor.experienceYears = Number(experienceYears);
    if (hospitalName) doctor.hospitalName = hospitalName;
    if (consultationFee !== undefined) doctor.consultationFee = Number(consultationFee);
    if (roomNumber) doctor.roomNumber = roomNumber;
    if (bio !== undefined) doctor.bio = bio;
    if (profilePhoto !== undefined) doctor.profilePhoto = profilePhoto;
    if (address) doctor.address = address;
    if (medicalLicenseNumber) doctor.medicalLicenseNumber = medicalLicenseNumber;

    await doctor.save();

    // Update phone/address in User model as well if provided
    if (phone || address) {
      const userUpdates = {};
      if (phone) userUpdates.phone = phone;
      if (address) userUpdates.address = address;
      await User.findByIdAndUpdate(req.user._id, userUpdates);
    }

    const updated = await Doctor.findById(doctor._id).populate('userId', 'name email phone gender');

    res.status(200).json({
      success: true,
      message: 'Doctor profile updated successfully',
      data: updated
    });
  } catch (err) {
    next(err);
  }
};

export const updateSchedule = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found for this account' });
    }

    const { 
      availableDays, 
      workingHours, 
      breakTime, 
      slotDurationMinutes, 
      consultationFee, 
      roomNumber, 
      isAvailable, 
      availabilityStatus 
    } = req.body;

    if (availableDays) doctor.availableDays = availableDays;
    if (workingHours) doctor.workingHours = workingHours;
    if (breakTime) doctor.breakTime = breakTime;
    if (slotDurationMinutes) doctor.slotDurationMinutes = Number(slotDurationMinutes);
    if (consultationFee !== undefined) doctor.consultationFee = Number(consultationFee);
    if (roomNumber) doctor.roomNumber = roomNumber;
    if (isAvailable !== undefined) doctor.isAvailable = isAvailable;
    if (availabilityStatus) doctor.availabilityStatus = availabilityStatus;

    await doctor.save();
    res.status(200).json({
      success: true,
      message: 'Doctor availability and schedule updated successfully',
      data: doctor
    });
  } catch (err) {
    next(err);
  }
};

export const updateAvailabilityStatus = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    const { availabilityStatus, status, busyInterval, clearBusyIntervals } = req.body;
    const targetStatus = availabilityStatus || status;

    if (targetStatus && Object.values(DOCTOR_AVAILABILITY_STATUS).includes(targetStatus)) {
      doctor.availabilityStatus = targetStatus;
    }

    if (clearBusyIntervals) {
      doctor.busyIntervals = [];
    } else if (busyInterval && busyInterval.date && busyInterval.startTime && busyInterval.endTime) {
      doctor.busyIntervals.push({
        date: new Date(busyInterval.date),
        startTime: busyInterval.startTime,
        endTime: busyInterval.endTime,
        reason: busyInterval.reason || 'Doctor unavailable during this time'
      });
    }

    await doctor.save();

    res.status(200).json({
      success: true,
      message: `Doctor status updated to ${doctor.availabilityStatus}`,
      data: {
        availabilityStatus: doctor.availabilityStatus,
        busyIntervals: doctor.busyIntervals
      }
    });
  } catch (err) {
    next(err);
  }
};

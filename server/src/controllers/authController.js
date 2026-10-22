import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Doctor } from '../models/Doctor.js';

const isGmailAddress = (email) => /^[^\s@]+@gmail\.com$/i.test(email.trim());

const generateToken = (userId, role) => {
  const secret = process.env.JWT_SECRET || 'meditrack_jwt_secret_dev_key_2026';
  return jwt.sign({ id: userId, role }, secret, { expiresIn: '7d' });
};

export const register = async (req, res, next) => {
  try {
    const { 
      name, 
      email, 
      password, 
      phone, 
      role, 
      dateOfBirth, 
      gender, 
      bloodGroup, 
      address,
      // Doctor-specific fields
      medicalLicenseNumber,
      specialization,
      qualification,
      experienceYears,
      hospitalName,
      consultationFee,
      profilePhoto,
      availableDays,
      workingHours,
      breakTime,
      roomNumber,
      bio
    } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, and phone number are required.'
      });
    }

    if (!isGmailAddress(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please use a valid Gmail address ending with @gmail.com.'
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists'
      });
    }

    const assignedRole = (role === 'doctor' || role === 'admin') ? role : 'patient';

    // Doctor specific validations
    if (assignedRole === 'doctor') {
      if (!medicalLicenseNumber || !specialization || !qualification) {
        return res.status(400).json({
          success: false,
          message: 'Medical license number, specialization, and qualification are required for doctor registration.'
        });
      }

      // Check unique medical license number
      const existingLicense = await Doctor.findOne({ 
        medicalLicenseNumber: medicalLicenseNumber.trim() 
      });
      if (existingLicense) {
        return res.status(409).json({
          success: false,
          message: 'A doctor account with this medical license number already exists.'
        });
      }
    }

    // Create Base User
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone,
      role: assignedRole,
      dateOfBirth,
      gender,
      bloodGroup: bloodGroup || 'unknown',
      address: address || {}
    });

    let doctorProfile = null;

    // Create Doctor Profile if role is doctor
    if (assignedRole === 'doctor') {
      const qualsArray = Array.isArray(qualification) 
        ? qualification 
        : [qualification].filter(Boolean);

      doctorProfile = await Doctor.create({
        userId: user._id,
        medicalLicenseNumber: medicalLicenseNumber.trim(),
        specialization: specialization.trim(),
        qualifications: qualsArray.length > 0 ? qualsArray : ['MBBS'],
        experienceYears: Number(experienceYears) || 1,
        hospitalName: hospitalName ? hospitalName.trim() : 'MediTrack Healthcare Center',
        consultationFee: Number(consultationFee) >= 0 ? Number(consultationFee) : 500,
        profilePhoto: profilePhoto || '',
        address: address || {},
        availableDays: availableDays && availableDays.length > 0 
          ? availableDays 
          : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        workingHours: workingHours || { start: '09:00', end: '17:00' },
        breakTime: breakTime || { start: '13:00', end: '14:00' },
        roomNumber: roomNumber || 'OPD-101',
        bio: bio || `Specialist in ${specialization}`,
        isAvailable: true,
        availabilityStatus: 'available'
      });
    }

    const token = generateToken(user._id, user.role);

    const safeUser = user.toObject();
    delete safeUser.password;

    res.status(201).json({
      success: true,
      message: `${assignedRole === 'doctor' ? 'Doctor' : 'Patient'} registered successfully`,
      data: {
        token,
        user: safeUser,
        doctor: doctorProfile
      }
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password'
      });
    }

    if (!isGmailAddress(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please use a valid Gmail address ending with @gmail.com.'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Password mismatch.'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Contact support.'
      });
    }

    let doctorProfile = null;
    if (user.role === 'doctor') {
      doctorProfile = await Doctor.findOne({ userId: user._id });
    }

    const token = generateToken(user._id, user.role);
    const safeUser = user.toObject();
    delete safeUser.password;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: safeUser,
        doctor: doctorProfile
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    let doctorProfile = null;

    if (user && user.role === 'doctor') {
      doctorProfile = await Doctor.findOne({ userId: user._id });
    }

    res.status(200).json({
      success: true,
      data: {
        user,
        doctor: doctorProfile
      }
    });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const updates = req.body;
    delete updates.password; // Do not update password through general profile
    delete updates.role;     // Role cannot be escalated through profile

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true
    }).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (err) {
    next(err);
  }
};

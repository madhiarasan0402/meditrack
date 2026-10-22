import dns from 'node:dns';

dns.setServers(['1.1.1.1', '8.8.8.8']);

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { User } from '../models/User.js';
import { Doctor } from '../models/Doctor.js';
import { DiagnosticTest } from '../models/DiagnosticTest.js';
import { Appointment } from '../models/Appointment.js';
import { TestBooking } from '../models/TestBooking.js';
import { Payment } from '../models/Payment.js';
import { Report } from '../models/Report.js';
import { HealthcareJourney } from '../models/HealthcareJourney.js';
import { 
  APPOINTMENT_STATUS, 
  TEST_BOOKING_STATUS, 
  PAYMENT_STATUS, 
  JOURNEY_STAGES, 
  REPORT_STATUS 
} from '../config/constants.js';

export const seedDatabase = async () => {
  console.log('[Seed]: Starting MediTrack database population...');

  // 1. Clean existing records
  await Promise.all([
    User.deleteMany({}),
    Doctor.deleteMany({}),
    DiagnosticTest.deleteMany({}),
    Appointment.deleteMany({}),
    TestBooking.deleteMany({}),
    Payment.deleteMany({}),
    Report.deleteMany({}),
    HealthcareJourney.deleteMany({})
  ]);

  // 2. Create Users
  const adminUser = await User.create({
    name: 'Chief Medical Administrator',
    email: 'admin.meditrack@gmail.com',
    password: 'admin123',
    role: 'admin',
    phone: '+91 9876543210',
    gender: 'other',
    address: { city: 'Chennai', state: 'Tamil Nadu' }
  });

  const patientUser = await User.create({
    name: 'Sarah Jenkins',
    email: 'patient.meditrack@gmail.com',
    password: 'patient123',
    role: 'patient',
    phone: '+91 9840123456',
    dateOfBirth: new Date('1994-06-15'),
    gender: 'female',
    bloodGroup: 'B+',
    address: { street: '14 Anna Nagar', city: 'Chennai', state: 'Tamil Nadu', zipCode: '600040' }
  });

  const doctor1User = await User.create({
    name: 'Dr. Rajesh Sharma',
    email: 'doctor.sharma.meditrack@gmail.com',
    password: 'doctor123',
    role: 'doctor',
    phone: '+91 9123456780',
    gender: 'male',
    address: { city: 'Chennai', state: 'Tamil Nadu' }
  });

  const doctor2User = await User.create({
    name: 'Dr. Priya Nair',
    email: 'doctor.priya.meditrack@gmail.com',
    password: 'doctor123',
    role: 'doctor',
    phone: '+91 9123456781',
    gender: 'female',
    address: { city: 'Chennai', state: 'Tamil Nadu' }
  });

  const doctor3User = await User.create({
    name: 'Dr. Amit Mehta',
    email: 'doctor.mehta.meditrack@gmail.com',
    password: 'doctor123',
    role: 'doctor',
    phone: '+91 9123456782',
    gender: 'male',
    address: { city: 'Chennai', state: 'Tamil Nadu' }
  });

  // 3. Create Doctor Profiles
  const doctor1 = await Doctor.create({
    userId: doctor1User._id,
    specialization: 'Cardiology',
    qualifications: ['MBBS', 'MD (Cardiology)', 'FACC'],
    experienceYears: 14,
    consultationFee: 800,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    workingHours: { start: '09:00', end: '16:00' },
    breakTime: { start: '13:00', end: '14:00' },
    slotDurationMinutes: 30,
    roomNumber: 'OPD-302',
    hospitalName: 'Apollo Specialty Hospitals',
    medicalLicenseNumber: 'MCI-1994-0821',
    availabilityStatus: 'available',
    bio: 'Senior Interventional Cardiologist specializing in preventive cardiology and hypertension management.'
  });

  const doctor2 = await Doctor.create({
    userId: doctor2User._id,
    specialization: 'General Medicine',
    qualifications: ['MBBS', 'MD (Internal Medicine)'],
    experienceYears: 10,
    consultationFee: 500,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    workingHours: { start: '09:30', end: '17:30' },
    breakTime: { start: '13:30', end: '14:30' },
    slotDurationMinutes: 30,
    roomNumber: 'OPD-105',
    hospitalName: 'Fortis Malar Hospital',
    medicalLicenseNumber: 'MCI-2005-4190',
    availabilityStatus: 'available',
    bio: 'General physician with expertise in lifestyle diseases, diabetic care, and infectious diseases.'
  });

  const doctor3 = await Doctor.create({
    userId: doctor3User._id,
    specialization: 'Dermatology',
    qualifications: ['MBBS', 'DDVL', 'MD (Dermatology)'],
    experienceYears: 8,
    consultationFee: 650,
    availableDays: ['Tuesday', 'Wednesday', 'Thursday', 'Saturday'],
    workingHours: { start: '10:00', end: '16:00' },
    breakTime: { start: '13:00', end: '14:00' },
    slotDurationMinutes: 30,
    roomNumber: 'OPD-210',
    hospitalName: 'Gleneagles Global Health City',
    medicalLicenseNumber: 'MCI-2011-9032',
    availabilityStatus: 'available',
    bio: 'Clinical dermatologist specialized in autoimmune skin conditions, allergies, and laser treatments.'
  });

  // 4. Create Diagnostic Tests Catalog
  const test1 = await DiagnosticTest.create({
    testName: 'Complete Blood Count (CBC) with ESR',
    testCode: 'CBC-101',
    category: 'Hematology',
    description: 'Comprehensive analysis of red cells, white cells, platelets, and erythrocyte sedimentation rate.',
    price: 450,
    preparationInstructions: 'No fasting required. Maintain normal hydration.',
    turnaroundHours: 12,
    isHomeSampleAvailable: true,
    sampleType: 'Whole Blood (EDTA)'
  });

  const test2 = await DiagnosticTest.create({
    testName: 'Lipid Profile Comprehensive',
    testCode: 'LIP-202',
    category: 'Biochemistry',
    description: 'Measures Total Cholesterol, HDL, LDL, VLDL, and Triglycerides to evaluate cardiovascular risk.',
    price: 750,
    preparationInstructions: 'Strict 10-12 hours overnight fasting mandatory. Only plain water allowed.',
    turnaroundHours: 24,
    isHomeSampleAvailable: true,
    sampleType: 'Serum'
  });

  const test3 = await DiagnosticTest.create({
    testName: 'Thyroid Profile (Total T3, T4 & TSH)',
    testCode: 'THY-303',
    category: 'Biochemistry',
    description: 'Assesses thyroid gland activity and metabolic regulation.',
    price: 600,
    preparationInstructions: 'Morning sample preferred before taking daily thyroid medication.',
    turnaroundHours: 24,
    isHomeSampleAvailable: true,
    sampleType: 'Serum'
  });

  const test4 = await DiagnosticTest.create({
    testName: 'HbA1c Glycated Hemoglobin',
    testCode: 'GLY-404',
    category: 'Biochemistry',
    description: 'Monitors average blood glucose levels over the prior 3-month period for diabetic assessment.',
    price: 550,
    preparationInstructions: 'Fasting not required.',
    turnaroundHours: 12,
    isHomeSampleAvailable: true,
    sampleType: 'Whole Blood'
  });

  const test5 = await DiagnosticTest.create({
    testName: 'Digital Chest X-Ray (PA View)',
    testCode: 'RAD-505',
    category: 'Radiology',
    description: 'High-resolution digital radiograph of chest, lungs, airway, heart, and chest wall.',
    price: 500,
    preparationInstructions: 'Remove all metallic jewelry and garments with metal fasteners.',
    turnaroundHours: 6,
    isHomeSampleAvailable: false,
    sampleType: 'Radiological Imaging'
  });

  // 5. Ensure sample PDF report exists on disk
  const uploadDir = path.resolve('uploads/reports');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const sampleReportPath = path.join(uploadDir, 'SAMPLE-LIPID-REPORT.pdf');
  if (!fs.existsSync(sampleReportPath)) {
    // Generate a minimal valid PDF binary placeholder
    const pdfContent = `%PDF-1.4
1 0 obj
<< /Title (MediTrack Laboratory Diagnostic Report)
   /Author (MediTrack Central Diagnostics) >>
endobj
2 0 obj
<< /Type /Catalog
   /Pages 3 0 R >>
endobj
3 0 obj
<< /Type /Pages
   /Kids [4 0 R]
   /Count 1 >>
endobj
4 0 obj
<< /Type /Page
   /Parent 3 0 R
   /MediaBox [0 0 612 792]
   /Contents 5 0 R
   /Resources << /Font << /F1 6 0 R >> >> >>
endobj
5 0 obj
<< /Length 210 >>
stream
BT
/F1 20 Tf
50 720 Td
(MEDITRACK CENTRAL DIAGNOSTICS) Tj
/F1 12 Tf
0 -30 Td
(Patient: Sarah Jenkins | Age: 30 | Ref: Dr. Rajesh Sharma) Tj
0 -25 Td
(Test: Lipid Profile Comprehensive [LIP-202]) Tj
0 -25 Td
(Total Cholesterol: 195 mg/dL  [Normal: <200]) Tj
0 -20 Td
(HDL Cholesterol:   52 mg/dL   [Normal: >50]) Tj
0 -20 Td
(LDL Cholesterol:   118 mg/dL  [Normal: <100]) Tj
0 -20 Td
(Triglycerides:     135 mg/dL  [Normal: <150]) Tj
0 -30 Td
(Status: Verified by Clinical Pathologist) Tj
ET
endstream
endobj
6 0 obj
<< /Type /Font
   /Subtype /Type1
   /BaseFont /Helvetica >>
endobj
xref
0 7
0000000000 65535 f 
0000000010 00000 n 
0000000103 00000 n 
0000000153 00000 n 
0000000219 00000 n 
0000000350 00000 n 
0000000613 00000 n 
trailer
<< /Size 7
   /Root 2 0 R >>
startxref
690
%%EOF`;
    fs.writeFileSync(sampleReportPath, pdfContent);
  }

  // 6. Create Completed Diagnostic Booking & Active Journey for Demo
  const completedBooking = await TestBooking.create({
    patientId: patientUser._id,
    testId: test2._id,
    bookingDate: new Date(Date.now() - 86400000 * 2), // 2 days ago
    timeSlot: '08:30-09:30',
    collectionType: 'home_collection',
    collectionAddress: patientUser.address,
    status: TEST_BOOKING_STATUS.COMPLETED,
    amount: test2.price
  });

  const payment1 = await Payment.create({
    patientId: patientUser._id,
    referenceType: 'TestBooking',
    referenceId: completedBooking._id,
    amount: test2.price,
    currency: 'INR',
    transactionId: 'TRX-DEMO-LIPID-8891',
    paymentMethod: 'mock_upi',
    paymentStatus: PAYMENT_STATUS.SUCCESSFUL,
    gatewayResponse: {
      simulationCode: 'SIM_AUTH_OK',
      receiptNumber: 'REC-DEMO-9912',
      authCode: 'AUTH-DEMO-99'
    },
    paidAt: new Date(Date.now() - 86400000 * 2)
  });

  const diagnosticJourney = await HealthcareJourney.create({
    patientId: patientUser._id,
    journeyType: 'diagnostic_investigation',
    title: `Diagnostic Investigation: ${test2.testName} (${test2.testCode})`,
    referenceType: 'TestBooking',
    referenceId: completedBooking._id,
    currentStage: JOURNEY_STAGES.REPORT_READY,
    isCompleted: false,
    events: [
      {
        stage: JOURNEY_STAGES.INITIATED,
        title: 'Diagnostic Test Booked',
        description: `${test2.testName} booked for home specimen collection.`,
        timestamp: new Date(Date.now() - 86400000 * 2),
        actorRole: 'patient',
        actorId: patientUser._id
      },
      {
        stage: JOURNEY_STAGES.CONFIRMED,
        title: 'Payment Received (₹750)',
        description: 'Mock UPI payment confirmed. Booking verified.',
        timestamp: new Date(Date.now() - 86400000 * 2 + 300000),
        actorRole: 'patient',
        actorId: patientUser._id
      },
      {
        stage: JOURNEY_STAGES.SAMPLE_COLLECTED,
        title: 'Home Phlebotomy Sample Collected',
        description: 'Specimen collected by field technician. Transported in temperature-controlled cooler.',
        timestamp: new Date(Date.now() - 86400000),
        actorRole: 'admin',
        actorId: adminUser._id
      },
      {
        stage: JOURNEY_STAGES.IN_PROGRESS,
        title: 'Biochemical Auto-Analyzer Running',
        description: 'Specimen centrifuged and analyzed for lipid fractions.',
        timestamp: new Date(Date.now() - 43200000),
        actorRole: 'admin',
        actorId: adminUser._id
      },
      {
        stage: JOURNEY_STAGES.REPORT_READY,
        title: 'Diagnostic Report Verified & Published',
        description: 'Clinical pathologist signed off. Available for online download.',
        timestamp: new Date(Date.now() - 3600000),
        actorRole: 'admin',
        actorId: adminUser._id
      }
    ]
  });

  completedBooking.journeyId = diagnosticJourney._id;
  await completedBooking.save();

  // Create report document linked to booking
  await Report.create({
    patientId: patientUser._id,
    testBookingId: completedBooking._id,
    testName: test2.testName,
    uploadedBy: adminUser._id,
    fileUrl: '/uploads/reports/SAMPLE-LIPID-REPORT.pdf',
    originalFileName: 'Sarah_Jenkins_Lipid_Profile_Report.pdf',
    fileMimeType: 'application/pdf',
    fileSizeBytes: 1240,
    clinicalRemarks: 'Mild elevation in LDL cholesterol (118 mg/dL). Dietary modification and exercise recommended. Review in 3 months.',
    status: REPORT_STATUS.PUBLISHED,
    journeyId: diagnosticJourney._id
  });

  // 7. Create Confirmed Doctor Appointment for Tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 30, 0, 0);

  const upcomingAppt = await Appointment.create({
    patientId: patientUser._id,
    doctorId: doctor1._id,
    appointmentDate: tomorrow,
    timeSlot: '10:30-11:00',
    reason: 'Review borderline cholesterol findings and preventive cardiac evaluation.',
    status: APPOINTMENT_STATUS.CONFIRMED,
    fee: doctor1.consultationFee
  });

  const apptPayment = await Payment.create({
    patientId: patientUser._id,
    referenceType: 'Appointment',
    referenceId: upcomingAppt._id,
    amount: doctor1.consultationFee,
    currency: 'INR',
    transactionId: 'TRX-DEMO-APPT-7721',
    paymentMethod: 'mock_card',
    paymentStatus: PAYMENT_STATUS.SUCCESSFUL,
    gatewayResponse: {
      simulationCode: 'SIM_AUTH_OK',
      receiptNumber: 'REC-DEMO-8833',
      authCode: 'AUTH-DEMO-77'
    },
    paidAt: new Date()
  });

  const apptJourney = await HealthcareJourney.create({
    patientId: patientUser._id,
    journeyType: 'doctor_consultation',
    title: `Consultation with Dr. Rajesh Sharma (Cardiology)`,
    referenceType: 'Appointment',
    referenceId: upcomingAppt._id,
    currentStage: JOURNEY_STAGES.CONFIRMED,
    events: [
      {
        stage: JOURNEY_STAGES.INITIATED,
        title: 'Appointment Booked',
        description: `Reserved consultation slot with Dr. Rajesh Sharma for ${tomorrow.toDateString()} at 10:30 AM.`,
        timestamp: new Date(Date.now() - 7200000),
        actorRole: 'patient',
        actorId: patientUser._id
      },
      {
        stage: JOURNEY_STAGES.CONFIRMED,
        title: 'Consultation Fee Paid (₹800)',
        description: 'Payment verified. Appointment confirmed for OPD-302.',
        timestamp: new Date(Date.now() - 3600000),
        actorRole: 'patient',
        actorId: patientUser._id
      }
    ]
  });

  upcomingAppt.journeyId = apptJourney._id;
  await upcomingAppt.save();

  console.log('[Seed]: Database successfully populated with realistic demo clinical records!');
  return {
    admin: adminUser.email,
    patient: patientUser.email,
    doctors: [doctor1User.email, doctor2User.email, doctor3User.email],
    password: 'password123 (or admin123, patient123, doctor123)'
  };
};

// Direct script execution support
if (process.argv[1]?.endsWith('seedData.js')) {
  import('../config/db.js').then(async ({ connectDB, disconnectDB }) => {
    await connectDB();
    await seedDatabase();
    await disconnectDB();
    process.exit(0);
  });
}

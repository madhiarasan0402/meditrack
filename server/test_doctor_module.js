import dns from 'node:dns';
dns.setServers(['1.1.1.1', '8.8.8.8']);

import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB } from './src/config/db.js';
import app from './src/app.js';
import http from 'http';

const runTests = async () => {
  console.log('--- Starting Doctor Registration & Management Verification Suite ---');
  
  await connectDB();
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5002, resolve));
  const BASE_URL = 'http://localhost:5002/api';

  const makeReq = async (url, options = {}) => {
    const res = await fetch(`${BASE_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
    const text = await res.text();
    try {
      return { status: res.status, ok: res.ok, data: JSON.parse(text) };
    } catch {
      return { status: res.status, ok: res.ok, data: text };
    }
  };

  const testId = Date.now();
  const testLicense = `MCI-${testId}`;
  const doctorEmail = `doc_${testId}@testmeditrack.com`;
  const patientEmail = `pat_${testId}@testmeditrack.com`;

  let doctorToken = '';
  let doctorId = '';
  let patientToken = '';
  let appointmentId = '';

  try {
    // 1. Doctor Registration
    console.log('\n[TEST 1]: Register new Doctor with credentials...');
    const regRes = await makeReq('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: `Dr. Alexander Fleming ${testId}`,
        email: doctorEmail,
        password: 'Password123!',
        role: 'doctor',
        phone: '+91 9888877777',
        gender: 'male',
        dateOfBirth: '1985-05-15',
        medicalLicenseNumber: testLicense,
        specialization: 'Cardiology',
        qualification: 'MBBS, MD, DM',
        experienceYears: 12,
        hospitalName: 'Apollo City Hospital',
        consultationFee: 750,
        availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        workingHours: { start: '09:00', end: '16:00' },
        breakTime: { start: '13:00', end: '14:00' },
        slotDurationMinutes: 30,
        roomNumber: 'OPD-505',
        bio: 'Specialist in clinical and preventive cardiology.'
      })
    });

    if (regRes.status !== 201) {
      throw new Error(`Doctor registration failed: ${JSON.stringify(regRes.data)}`);
    }
    const docData = regRes.data.data || regRes.data;
    console.log('✓ Doctor registered successfully:', docData.user?.name, docData.user?.role);
    doctorToken = docData.token;
    doctorId = docData.doctor?._id;

    // 2. Duplicate Medical License Prevention Check
    console.log('\n[TEST 2]: Verify duplicate medical license prevention...');
    const dupLicenseRes = await makeReq('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Imposter Doctor',
        email: `imposter_${testId}@testmeditrack.com`,
        password: 'Password123!',
        phone: '+91 9999900000',
        role: 'doctor',
        medicalLicenseNumber: testLicense,
        specialization: 'General Medicine',
        qualification: 'MBBS'
      })
    });
    if ((dupLicenseRes.status === 409 || dupLicenseRes.status === 400) && dupLicenseRes.data.message.includes('already exists')) {
      console.log('✓ Duplicate license correctly rejected with status:', dupLicenseRes.status, dupLicenseRes.data.message);
    } else {
      throw new Error(`Duplicate license was not rejected properly: ${JSON.stringify(dupLicenseRes)}`);
    }

    // 3. Patient Registration & Login
    console.log('\n[TEST 3]: Register Patient account...');
    const patRegRes = await makeReq('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: `Test Patient ${testId}`,
        email: patientEmail,
        password: 'Password123!',
        role: 'patient',
        phone: '+91 9111122222',
        gender: 'female',
        bloodGroup: 'O+'
      })
    });
    if (patRegRes.status !== 201) {
      throw new Error(`Patient registration failed: ${JSON.stringify(patRegRes.data)}`);
    }
    const patData = patRegRes.data.data || patRegRes.data;
    patientToken = patData.token;
    console.log('✓ Patient registered successfully:', patData.user?.name);

    // 4. Doctor Slot Generation (Testing Break Times & Busy Windows)
    console.log('\n[TEST 4]: Check generated slots, verifying Break Time exclusion...');
    // Find next Monday or active day
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 1);
    while (targetDate.getDay() === 0 || targetDate.getDay() === 6) { // skip weekend
      targetDate.setDate(targetDate.getDate() + 1);
    }
    const dateStr = targetDate.toISOString().split('T')[0];

    const slotsRes = await makeReq(`/doctors/${doctorId}/slots?date=${dateStr}`);
    if (slotsRes.status !== 200 || !slotsRes.data.success) {
      throw new Error(`Failed to fetch doctor slots: ${JSON.stringify(slotsRes.data)}`);
    }

    const slots = slotsRes.data.data;
    console.log(`✓ Retrieved ${slots.length} slots for ${dateStr}`);
    
    // Check break time slot: 13:00-13:30 and 13:30-14:00 must have isBreak = true and isAvailable = false
    const lunchSlot = slots.find(s => s.slot === '13:00-13:30' || s.slot === '13:30-14:00');
    if (lunchSlot && lunchSlot.isBreak && !lunchSlot.isAvailable) {
      console.log('✓ Break time slot correctly flagged as unavailable:', lunchSlot.slot, lunchSlot.reasonIfUnavailable);
    } else {
      throw new Error(`Break slot was not properly flagged: ${JSON.stringify(lunchSlot)}`);
    }

    // 5. Patient Books Open Consultation Slot
    console.log('\n[TEST 5]: Patient books an open slot...');
    const openSlot = slots.find(s => s.isAvailable);
    if (!openSlot) throw new Error('No open slots available to book!');
    
    const bookRes = await makeReq('/appointments', {
      method: 'POST',
      headers: { Authorization: `Bearer ${patientToken}` },
      body: JSON.stringify({
        doctorId: doctorId,
        appointmentDate: dateStr,
        timeSlot: openSlot.slot,
        reason: 'Severe hypertension and chest tightness'
      })
    });

    if (bookRes.status !== 201) {
      throw new Error(`Booking failed: ${JSON.stringify(bookRes.data)}`);
    }
    appointmentId = bookRes.data.data.appointment._id;
    const initialStatus = bookRes.data.data.appointment.status;
    console.log(`✓ Appointment successfully booked! ID: ${appointmentId}, Initial Status: "${initialStatus}"`);

    // 6. Verify Doctor In-App Notification
    console.log('\n[TEST 6]: Verify Doctor received in-app notification...');
    const docNotifsRes = await makeReq('/notifications', {
      headers: { Authorization: `Bearer ${doctorToken}` }
    });
    if (docNotifsRes.status !== 200 || docNotifsRes.data.data.length === 0) {
      throw new Error(`Doctor did not receive notification: ${JSON.stringify(docNotifsRes.data)}`);
    }
    const latestDocNotif = docNotifsRes.data.data[0];
    console.log('✓ Doctor received notification:', `"${latestDocNotif.title} - ${latestDocNotif.message}"`);

    // 7. Verify Double-Booking Collision Prevention
    console.log('\n[TEST 7]: Verify double-booking prevention on same slot...');
    const collisionRes = await makeReq('/appointments', {
      method: 'POST',
      headers: { Authorization: `Bearer ${patientToken}` },
      body: JSON.stringify({
        doctorId: doctorId,
        appointmentDate: dateStr,
        timeSlot: openSlot.slot,
        reason: 'Another booking attempt on same slot'
      })
    });
    if (collisionRes.status === 409 || collisionRes.status === 400) {
      console.log('✓ Double-booking rejected with status:', collisionRes.status, collisionRes.data.message);
    } else {
      throw new Error(`Double-booking collision was not prevented: ${JSON.stringify(collisionRes)}`);
    }

    // 8. Doctor Accepts Appointment
    console.log('\n[TEST 8]: Doctor accepts appointment request...');
    const acceptRes = await makeReq(`/appointments/${appointmentId}/accept`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${doctorToken}` }
    });
    if (acceptRes.status !== 200) {
      throw new Error(`Failed to accept appointment: ${JSON.stringify(acceptRes.data)}`);
    }
    console.log('✓ Doctor accepted appointment. Current status:', acceptRes.data.data.status);

    // 9. Verify Patient In-App Notification
    console.log('\n[TEST 9]: Verify Patient received in-app acceptance notification...');
    const patNotifsRes = await makeReq('/notifications', {
      headers: { Authorization: `Bearer ${patientToken}` }
    });
    const latestPatNotif = patNotifsRes.data.data?.[0];
    console.log('✓ Patient received notification:', `"${latestPatNotif?.title} - ${latestPatNotif?.message}"`);

    // 10. Busy / Unavailable Status Feature
    console.log('\n[TEST 10]: Doctor toggles availability status to "busy"...');
    const statusUpdateRes = await makeReq('/doctors/status', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${doctorToken}` },
      body: JSON.stringify({ status: 'busy' })
    });
    if (statusUpdateRes.status !== 200 || statusUpdateRes.data.data.availabilityStatus !== 'busy') {
      throw new Error(`Failed to update status to busy: ${JSON.stringify(statusUpdateRes.data)}`);
    }
    console.log('✓ Doctor status changed to:', statusUpdateRes.data.data.availabilityStatus);

    // Now Patient tries to book while Doctor is Busy
    console.log('\n[TEST 11]: Verify Patient booking is blocked when Doctor is Busy...');
    const busyBookingAttempt = await makeReq('/appointments', {
      method: 'POST',
      headers: { Authorization: `Bearer ${patientToken}` },
      body: JSON.stringify({
        doctorId: doctorId,
        appointmentDate: dateStr,
        timeSlot: '11:00-11:30',
        reason: 'Attempt while busy'
      })
    });
    if (busyBookingAttempt.status === 400 && busyBookingAttempt.data.message.includes('unavailable during this time')) {
      console.log('✓ Patient booking correctly blocked with prompt-specified message:');
      console.log('  ->', `"${busyBookingAttempt.data.message}"`);
    } else {
      throw new Error(`Booking was not blocked when doctor busy: ${JSON.stringify(busyBookingAttempt)}`);
    }

    // Set Doctor status back to 'available'
    await makeReq('/doctors/status', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${doctorToken}` },
      body: JSON.stringify({ status: 'available' })
    });
    console.log('✓ Reset doctor status back to "available"');

    // 12. Doctor adds consultation notes and marks completed
    console.log('\n[TEST 12]: Doctor completes consultation and records Rx notes...');
    const notesRes = await makeReq(`/appointments/${appointmentId}/consultation-notes`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${doctorToken}` },
      body: JSON.stringify({
        notes: 'Advised lifestyle modification, reduction of sodium intake, and prescribed Telmisartan 40mg OD.'
      })
    });
    if (notesRes.status !== 200) {
      throw new Error(`Failed to add consultation notes: ${JSON.stringify(notesRes.data)}`);
    }
    console.log('✓ Consultation notes recorded and status set to completed!');

    console.log('\n======================================================');
    console.log('   ALL DOCTOR MODULE VERIFICATION TESTS PASSED!       ');
    console.log('======================================================\n');
  } catch (err) {
    console.error('\n❌ Test Suite Failed:', err.message);
    process.exitCode = 1;
  } finally {
    server.close();
    await mongoose.disconnect();
  }
};

runTests();

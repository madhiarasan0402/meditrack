# MediTrack — Digital Healthcare Journey Management System
> **An Integrated MERN Platform for Doctor Appointments, Diagnostic Testing, Mock Payments, Digital Reports, and Longitudinal Healthcare Journey Tracking.**

---

## 1. Project Background & Document Alignment

MediTrack was conceptualized and engineered strictly according to the problem statement and system requirements defined in **`Digital_Healthcare_updated.pdf`** (*Department of Information Technology, Easwari Engineering College*).

### The Core Problem Solved
Traditional healthcare services are disconnected across independent silos:
* **Fragmented Services**: Scheduling, laboratory testing, payments, and reporting occur in isolation.
* **Paper-Based Inefficiency**: Patients frequently make repeat visits to clinics and diagnostic centers just to pick up physical test papers.
* **Lack of Journey Visibility**: Patients have no single unified view to monitor their clinical care progress from booking to result delivery.

MediTrack solves this with a **Centralized Healthcare Journey Engine** that synchronizes appointments, diagnostics, billing, and report distribution into a continuous, real-time longitudinal event pipeline.

---

## 2. Pre-Configured Demo Credentials (1-Click Test Access)

The application includes pre-seeded demo accounts with rich historical clinical records, active appointments, pending lab orders, and published PDF diagnostic reports:

| Role | Email | Password | Primary Capabilities |
| :--- | :--- | :--- | :--- |
| **Patient** | `patient.meditrack@gmail.com` | `patient123` | View active journeys, book doctors, order lab tests, pay via mock gateway, download PDF reports |
| **Doctor** | `doctor.sharma.meditrack@gmail.com` | `doctor123` | Manage OPD queue, write clinical notes & digital prescriptions, prescribe lab investigations, set schedule |
| **Doctor (General)** | `doctor.priya.meditrack@gmail.com` | `doctor123` | General Medicine consultation queue & schedule settings |
| **Doctor (Dermatology)** | `doctor.mehta.meditrack@gmail.com` | `doctor123` | Dermatology consultation queue & schedule settings |
| **Admin / Lab Tech** | `admin.meditrack@gmail.com` | `admin123` | View system analytics & revenue, manage diagnostic catalog, update specimen status, upload PDF reports, reset DB |

*(Tip: On the `/login` screen, click any of the 1-Click Fast Evaluation buttons to instantly populate credentials!)*

---

## 3. System Architecture & The Healthcare Journey Engine

### The 5-Stage Longitudinal Journey Progression
```
[ (1) HOLD CREATED ] ---> [ (2) PAID & CONFIRMED ] ---> [ (3) CLINICAL ACTION ] ---> [ (4) REPORT READY ] ---> [ (5) COMPLETED ]
   - Slot Reserved           - Mock Card/UPI/NetBank      - OPD Consultation OR          - PDF Lab Report              - Report Viewed /
   - Journey Initiated       - Auto-Reconciliation        - Phlebotomy Specimen            Uploaded by Lab               Rx Archived
```

Every state transition records an immutable event with:
* `stage`: Controlled status enum
* `title` & `description`: Patient-friendly and clinical details
* `timestamp`: ISO Date
* `actorRole`: `patient`, `doctor`, `admin`, or `system`
* `metadata`: Key-value pairs (e.g., Transaction ID, Doctor Name, Room #, Lab Code)

---

## 4. Technology Stack Verification

| Tier | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18 (Vite) | Fast, responsive component rendering with reactive journey state |
| **Styling** | Tailwind CSS | Modern healthcare design system with mobile responsiveness |
| **Routing** | React Router v6 | Role-based protected routes and dynamic routing (`/doctors/:id`) |
| **Icons** | Lucide React | Medical iconography (`Stethoscope`, `FlaskConical`, `Compass`, etc.) |
| **HTTP Client** | Axios | Automatic JWT Bearer token attachment via request interceptors |
| **Backend** | Node.js + Express.js | High-throughput asynchronous REST API server |
| **Authentication** | JWT (`jsonwebtoken`) + `bcryptjs` | Stateless authentication and role-based access control (RBAC) |
| **Database** | MongoDB + Mongoose | Polymorphic documents linking journeys to appointments and lab bookings |
| **Database Fallback** | `mongodb-memory-server` | Automatic fallback if local MongoDB service is inactive (zero setup) |
| **File Storage** | Multer (Local Disk) | Safe storage of diagnostic PDF reports with MIME validation and secure streaming |

---

## 5. Quick Start & Setup Instructions

### Prerequisites
* **Node.js** (v18 or higher)
* **npm** (v9 or higher)

### Installation
From the root directory (`c:\digital healthcare`):
```bash
# 1. Install all dependencies for both backend and frontend
npm run install:all
```

### Running the Application
Open two terminal windows:

#### Terminal 1 — Start the Backend Server (Port 5000):
```bash
cd server
npm run dev
```
*The server will automatically connect to MongoDB (or launch the built-in in-memory MongoDB fallback) and seed all demo data automatically!*
*Backend Health Check: `http://localhost:5000/api/health`*

#### Terminal 2 — Start the React Frontend (Port 3000):
```bash
cd client
npm run dev
```
*Open your browser and navigate to: `http://localhost:3000`*

---

## 6. End-to-End Evaluation & Demonstration Flow

To demonstrate the full power of MediTrack to an examiner or user:

### Step 1: Login as Patient
1. Go to `http://localhost:3000/login`.
2. Click **Patient (Sarah J.)** to auto-fill credentials and click **Sign In**.
3. View the **Patient Dashboard**:
   * Observe the active **Cardiology Journey Stepper** and **Lipid Profile Diagnostic Journey**.
   * Inspect the upcoming appointments widget and available reports.

### Step 2: Book a Doctor Consultation & Mock Payment
1. Click **Book Doctor** on the navigation bar.
2. Select **Dr. Rajesh Sharma (Cardiology)** and click **Select Slot & Book**.
3. Choose a date, select an open 30-minute slot (e.g. `11:00-11:30`), type symptoms, and click **Reserve Slot & Proceed to Mock Payment**.
4. The **Mock Payment Modal** opens:
   * Select **UPI** or **Card**.
   * Leave simulation mode set to **Simulate Success**.
   * Click **Authorise Payment**.
5. Observe the instant payment confirmation, transaction receipt, and observe the new Journey created in **My Journeys**.

### Step 3: Doctor Consultation & Prescription
1. Log out, then log in using **Doctor (Dr. Sharma)**.
2. The **Consultation Queue** displays today's scheduled patients.
3. Click **Start Consult** on the patient's card.
4. In the clinical workspace modal:
   * Add clinical observations / notes.
   * Add a digital medication prescription (e.g., Amlodipine 5mg, 1-0-1, 15 days).
   * Check off ordered diagnostic tests.
   * Click **Complete Consultation & Issue Digital Prescription**.
5. The appointment is marked **Completed**, and the patient's Healthcare Journey automatically updates!

### Step 4: Diagnostic Lab Specimen Workflow
1. Log out, then log in using **Admin (Chief Admin)**.
2. Navigate to **Manage Bookings** (`/admin/bookings`).
3. View active diagnostic test orders.
4. Advance the specimen workflow:
   * Click **Mark Sample Collected** (advances journey to *Sample Collected*).
   * Click **Send to Analyzer** (advances journey to *In Progress*).
   * Click **Upload PDF Report** (or navigate to `/admin/upload-report`).
5. Choose a test booking, select a PDF report file, add pathologist remarks, and click **Publish Report**.
6. The test is completed and the patient's journey advances to **Report Ready**!

### Step 5: Patient Views and Downloads Certified Report
1. Log in back as **Patient**.
2. Notice the top banner announces: **Report Ready for Download**.
3. Go to **My Reports** (`/patient/reports`).
4. Click **Download PDF**.
5. The report opens/downloads securely from the server, and the Healthcare Journey automatically records the final milestone: **Report Viewed by Patient & Journey Completed**!

---

## 7. Database Collections & Architecture

1. `users`: Authentication records, role definitions (`patient`, `doctor`, `admin`), personal profile, and blood group.
2. `doctors`: Specialization, qualifications, experience, consultation fee, room number, working days, and 30-minute slot intervals.
3. `appointments`: Doctor-patient reservations, timeslot uniqueness constraints, consultation notes, prescriptions, and journey linkage.
4. `diagnostictests`: Laboratory test catalog, turnaround times, sample requirements, and home phlebotomy flags.
5. `testbookings`: Patient diagnostic bookings, home address dispatch, sample states, and journey linkage.
6. `payments`: Mock payment ledger, transaction hashes, receipts, and payment status state machines.
7. `reports`: File metadata on local disk storage, mime types, pathologist remarks, and view timestamps.
8. `healthcarejourneys`: Longitudinal event stream containing chronologically ordered micro-events, actor roles, and stage milestones.

---

## 8. Academic Viva Defense & Key Talking Points

When presenting this project:
1. **Explain the Differentiation**: "Most hospital apps are basic CRUD forms. MediTrack is built around an event-driven **Healthcare Journey Engine** that models longitudinal patient care, eliminating fragmentation as recommended by WHO digital health guidelines."
2. **Explain the Slot Collision Algorithm**: "Doctor slot availability is computed dynamically by calculating all potential intervals from doctor working hours and filtering out booked appointments using MongoDB compound unique indexes."
3. **Explain the Mock Payment System**: "Rather than risking third-party gateway downtime or expired test API keys during viva presentations, we built an atomic mock state machine that accurately models bank approvals, declines, and booking confirmations."
4. **Explain the Secure File Handling**: "Reports are validated by MIME type and size in Express via Multer, stored with sanitized unique timestamps on disk, and streamed through RBAC-protected endpoints to prevent unauthorized access."

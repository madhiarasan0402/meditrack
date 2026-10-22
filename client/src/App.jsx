import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { JourneyProvider } from './context/JourneyContext';

// Common Components
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Public & Auth Pages
import { HomePage } from './pages/public/HomePage';
import { DoctorsCatalogPage } from './pages/public/DoctorsCatalogPage';
import { DiagnosticsCatalogPage } from './pages/public/DiagnosticsCatalogPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { NotFoundPage } from './pages/public/NotFoundPage';

// Patient Pages
import { PatientDashboard } from './pages/patient/PatientDashboard';
import { MyJourneysPage } from './pages/patient/MyJourneysPage';
import { MyReportsPage } from './pages/patient/MyReportsPage';

// Doctor Pages
import { DoctorDashboard } from './pages/doctor/DoctorDashboard';
import { DoctorSchedulePage } from './pages/doctor/DoctorSchedulePage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ManageBookingsPage } from './pages/admin/ManageBookingsPage';
import { ManageTestsPage } from './pages/admin/ManageTestsPage';
import { UploadReportsPage } from './pages/admin/UploadReportsPage';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <JourneyProvider>
          <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 selection:bg-primary-500 selection:text-white">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                {/* Public Pages */}
                <Route path="/" element={<HomePage />} />
                <Route path="/doctors" element={<DoctorsCatalogPage />} />
                <Route path="/diagnostics" element={<DiagnosticsCatalogPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Patient Routes */}
                <Route
                  path="/patient/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['patient']}>
                      <PatientDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/patient/journeys"
                  element={
                    <ProtectedRoute allowedRoles={['patient']}>
                      <MyJourneysPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/patient/reports"
                  element={
                    <ProtectedRoute allowedRoles={['patient']}>
                      <MyReportsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Doctor Routes */}
                <Route
                  path="/doctor/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['doctor']}>
                      <DoctorDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/doctor/schedule"
                  element={
                    <ProtectedRoute allowedRoles={['doctor']}>
                      <DoctorSchedulePage />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Routes */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/bookings"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <ManageBookingsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/tests"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <ManageTestsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/upload-report"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <UploadReportsPage />
                    </ProtectedRoute>
                  }
                />

                {/* 404 Fallback */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </JourneyProvider>
      </AuthProvider>
    </Router>
  );
}

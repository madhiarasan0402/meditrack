import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Activity, 
  User, 
  LogOut, 
  Calendar, 
  FlaskConical, 
  Compass, 
  FileText, 
  Menu, 
  X, 
  ShieldCheck, 
  Stethoscope,
  Bell,
  CheckCheck
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { notificationService } from '../../services/notificationService';

export const Navbar = () => {
  const { user, logout, isPatient, isDoctor, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    if (user) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 15000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user]);

  // Click outside to close notification dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await notificationService.getMyNotifications();
      if (res.success) {
        setNotifications(res.data);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (err) {
      // silently ignore background notification fetch error
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.warn('Error marking notifications as read:', err);
    }
  };

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.isRead) {
        await notificationService.markAsRead(notif._id);
        setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      setShowNotifications(false);

      if (isDoctor) {
        navigate('/doctor/dashboard');
      } else if (isPatient) {
        navigate('/patient/dashboard');
      }
    } catch (err) {
      console.warn('Error handling notification click:', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-700 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-primary-500/20">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight text-slate-900">
                  Medi<span className="text-primary-600">Track</span>
                </span>
                <span className="hidden sm:inline-block ml-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary-50 text-primary-700 border border-primary-100">
                  Journey System
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {!user ? (
              <>
                <Link
                  to="/"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive('/') ? 'text-primary-600 bg-primary-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Home
                </Link>
                <Link
                  to="/doctors"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive('/doctors') ? 'text-primary-600 bg-primary-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Doctors
                </Link>
                <Link
                  to="/diagnostics"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive('/diagnostics') ? 'text-primary-600 bg-primary-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Diagnostic Tests
                </Link>
              </>
            ) : isPatient ? (
              <>
                <Link
                  to="/patient/dashboard"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive('/patient/dashboard') ? 'text-primary-600 bg-primary-50 font-semibold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/doctors"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive('/doctors') ? 'text-primary-600 bg-primary-50 font-semibold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Book Doctor
                </Link>
                <Link
                  to="/diagnostics"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive('/diagnostics') ? 'text-primary-600 bg-primary-50 font-semibold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Book Lab Test
                </Link>
                <Link
                  to="/patient/journeys"
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive('/patient/journeys') ? 'text-cyan-700 bg-cyan-50 font-semibold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Compass className="w-4 h-4 text-cyan-600" />
                  <span>My Journeys</span>
                </Link>
                <Link
                  to="/patient/reports"
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive('/patient/reports') ? 'text-primary-600 bg-primary-50 font-semibold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>My Reports</span>
                </Link>
              </>
            ) : isDoctor ? (
              <>
                <Link
                  to="/doctor/dashboard"
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive('/doctor/dashboard') ? 'text-primary-600 bg-primary-50 font-semibold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Stethoscope className="w-4 h-4" />
                  <span>Consultation Queue</span>
                </Link>
                <Link
                  to="/doctor/schedule"
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive('/doctor/schedule') ? 'text-primary-600 bg-primary-50 font-semibold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Schedule & Slots</span>
                </Link>
              </>
            ) : isAdmin ? (
              <>
                <Link
                  to="/admin/dashboard"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive('/admin/dashboard') ? 'text-primary-600 bg-primary-50 font-semibold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Overview
                </Link>
                <Link
                  to="/admin/bookings"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive('/admin/bookings') ? 'text-primary-600 bg-primary-50 font-semibold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Manage Bookings
                </Link>
                <Link
                  to="/admin/tests"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive('/admin/tests') ? 'text-primary-600 bg-primary-50 font-semibold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Test Directory
                </Link>
                <Link
                  to="/admin/upload-report"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive('/admin/upload-report') ? 'text-indigo-600 bg-indigo-50 font-semibold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span>Upload Lab Report</span>
                </Link>
              </>
            ) : null}
          </div>

          {/* User Account / Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {!user ? (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-sm transition"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <div className="flex items-center space-x-3 pl-3 border-l border-slate-200">
                {/* Notification Bell */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    title="Notifications"
                    className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition relative"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden">
                      <div className="p-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-slate-900">Notifications</span>
                          {unreadCount > 0 && (
                            <span className="px-1.5 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-extrabold rounded-md">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-[11px] text-primary-600 hover:text-primary-700 font-semibold flex items-center space-x-1"
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                            <span>Mark all read</span>
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-xs text-slate-400">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n._id}
                              onClick={() => handleNotificationClick(n)}
                              className={`p-3 text-xs transition cursor-pointer hover:bg-slate-50 flex items-start space-x-2.5 ${
                                !n.isRead ? 'bg-primary-50/40' : ''
                              }`}
                            >
                              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                                !n.isRead ? 'bg-primary-600' : 'bg-slate-300'
                              }`} />
                              <div className="flex-1">
                                <p className="font-bold text-slate-900 leading-snug">{n.title}</p>
                                <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">{n.message}</p>
                                <span className="text-[10px] text-slate-400 mt-1 block">
                                  {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col text-right">
                  <span className="text-sm font-bold text-slate-900 leading-tight">{user.name}</span>
                  <span className="text-[11px] font-semibold text-primary-600 uppercase tracking-wide">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile hamburger & notification */}
          <div className="flex items-center space-x-2 md:hidden">
            {user && (
              <button
                onClick={() => {
                  if (isDoctor) navigate('/doctor/dashboard');
                  else if (isPatient) navigate('/patient/dashboard');
                }}
                className="p-2 text-slate-500 hover:text-slate-800 rounded-lg relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-2">
          {!user ? (
            <>
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700 font-medium">Home</Link>
              <Link to="/doctors" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700 font-medium">Doctors</Link>
              <Link to="/diagnostics" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700 font-medium">Diagnostic Tests</Link>
              <div className="pt-2 flex flex-col space-y-2">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-2 text-slate-800 font-medium bg-slate-100 rounded-lg">Log In</Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-2 text-white font-medium bg-primary-600 rounded-lg">Register</Link>
              </div>
            </>
          ) : (
            <>
              <div className="py-2 border-b border-slate-100">
                <p className="text-sm font-bold text-slate-900">{user.name}</p>
                <p className="text-xs text-primary-600 uppercase font-semibold">{user.role}</p>
              </div>
              {isPatient && (
                <>
                  <Link to="/patient/dashboard" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700">Dashboard</Link>
                  <Link to="/doctors" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700">Book Doctor</Link>
                  <Link to="/diagnostics" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700">Book Lab Test</Link>
                  <Link to="/patient/journeys" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-cyan-700 font-medium">My Journeys</Link>
                  <Link to="/patient/reports" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700">My Reports</Link>
                </>
              )}
              {isDoctor && (
                <>
                  <Link to="/doctor/dashboard" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700">Consultation Queue</Link>
                  <Link to="/doctor/schedule" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700">Schedule & Availability</Link>
                </>
              )}
              {isAdmin && (
                <>
                  <Link to="/admin/dashboard" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700">Dashboard</Link>
                  <Link to="/admin/bookings" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700">Bookings</Link>
                  <Link to="/admin/tests" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700">Test Directory</Link>
                  <Link to="/admin/upload-report" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-indigo-700">Upload Lab Report</Link>
                </>
              )}
              <button
                onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                className="w-full text-left py-2 text-rose-600 font-medium flex items-center space-x-1"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

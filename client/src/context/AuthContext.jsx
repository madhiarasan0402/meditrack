import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('meditrack_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('meditrack_token');
      const storedUser = localStorage.getItem('meditrack_user');
      const storedDoctor = localStorage.getItem('meditrack_doctor');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          if (storedDoctor) setDoctor(JSON.parse(storedDoctor));
          setToken(storedToken);

          // Refresh user data from server in background
          const fresh = await authService.getProfile();
          if (fresh.success && fresh.data) {
            const userData = fresh.data.user || fresh.data;
            setUser(userData);
            localStorage.setItem('meditrack_user', JSON.stringify(userData));
            if (fresh.data.doctor) {
              setDoctor(fresh.data.doctor);
              localStorage.setItem('meditrack_doctor', JSON.stringify(fresh.data.doctor));
            }
          }
        } catch (err) {
          console.warn('Session expired or invalid, logging out...');
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    if (res.success && res.data) {
      setUser(res.data.user);
      setToken(res.data.token);
      localStorage.setItem('meditrack_token', res.data.token);
      localStorage.setItem('meditrack_user', JSON.stringify(res.data.user));

      if (res.data.doctor) {
        setDoctor(res.data.doctor);
        localStorage.setItem('meditrack_doctor', JSON.stringify(res.data.doctor));
      } else {
        setDoctor(null);
        localStorage.removeItem('meditrack_doctor');
      }

      return res.data.user;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    if (res.success && res.data) {
      setUser(res.data.user);
      setToken(res.data.token);
      localStorage.setItem('meditrack_token', res.data.token);
      localStorage.setItem('meditrack_user', JSON.stringify(res.data.user));

      if (res.data.doctor) {
        setDoctor(res.data.doctor);
        localStorage.setItem('meditrack_doctor', JSON.stringify(res.data.doctor));
      } else {
        setDoctor(null);
        localStorage.removeItem('meditrack_doctor');
      }

      return res.data.user;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = () => {
    setUser(null);
    setDoctor(null);
    setToken(null);
    localStorage.removeItem('meditrack_token');
    localStorage.removeItem('meditrack_user');
    localStorage.removeItem('meditrack_doctor');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('meditrack_user', JSON.stringify(updatedUser));
  };

  const updateDoctor = (updatedDoctor) => {
    setDoctor(updatedDoctor);
    localStorage.setItem('meditrack_doctor', JSON.stringify(updatedDoctor));
  };

  return (
    <AuthContext.Provider value={{
      user,
      doctor,
      token,
      loading,
      login,
      register,
      logout,
      updateUser,
      updateDoctor,
      isAuthenticated: !!user,
      isPatient: user?.role === 'patient',
      isDoctor: user?.role === 'doctor',
      isAdmin: user?.role === 'admin'
    }}>
      {children}
    </AuthContext.Provider>
  );
};

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';

// Components
import { LandingPage } from "./components/LandingPage";
import { CanvasDashboard } from "./components/CanvasDashboard";
import { OTPVerify } from "./components/OTPVerify";
import { DoctorDashboard } from "./components/DoctorDashboard";

// Wrapper for the OTP Verify component to handle navigation logic
const DoctorLogin = () => {
  const navigate = useNavigate();
  
  const handleLoginSuccess = (token) => {
    // In a real app, you'd store the token: localStorage.setItem('token', token);
    // For this demo, we just navigate.
    navigate('/doctor/dashboard');
  };

  return <OTPVerify onLoginSuccess={handleLoginSuccess} />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* 1. Public Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* 2. Patient Side: File Upload Dashboard */}
        <Route path="/dashboard" element={<CanvasDashboard />} />

        {/* 3. Doctor Side: Login (OTP) */}
        <Route path="/doctor" element={<DoctorLogin />} />

        {/* 4. Doctor Side: Main Dashboard (Protected) */}
        <Route path="/doctor/dashboard" element={<DoctorDashboard />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/Layout/ProtectedRoute';
import Navbar from './components/Layout/Navbar';

// Auth Pages
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import OTPVerification from './components/Auth/OTPVerification';

// Main Pages
import Home from './components/Home/Home';
import AlertsPage from './components/Alerts/AlertsPage';
import HelpersPage from './components/Helpers/HelpersPage';
import LiveTracking from './components/LiveTracking/LiveTracking';
import ChatPage from './components/Chat/ChatPage';
import BloodPage from './components/Blood/BloodPage';
import HospitalPage from './components/Hospital/HospitalPage';
import CommunityBillboard from './components/Community/CommunityBillboard';
import PaymentPage from './components/Payment/PaymentPage';
import UserProfile from './components/Profile/UserProfile';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <div className="min-h-screen bg-sos-dark">
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: '#2d2d44',
                  color: '#fff',
                },
              }}
            />
            <Navbar />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-otp" element={<OTPVerification />} />
              
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Home />} />
                <Route path="/alerts" element={<AlertsPage />} />
                <Route path="/helpers" element={<HelpersPage />} />
                <Route path="/live" element={<LiveTracking />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/blood" element={<BloodPage />} />
                <Route path="/hospital" element={<HospitalPage />} />
                <Route path="/community" element={<CommunityBillboard />} />
                <Route path="/payment" element={<PaymentPage />} />
                <Route path="/profile" element={<UserProfile />} />
              </Route>
            </Routes>
          </div>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import LegalCaseManagement from './pages/LegalCaseManagement';
import ClientManagement from './pages/ClientManagement';
import AttorneyCalendar from './pages/AttorneyCalendar';
import AppointmentForm from './pages/AppointmentForm';
import PaymentManagement from './pages/PaymentManagement';
import SecretaryManagement from './pages/SecretaryManagement';
import SessionManagement from './pages/SessionManagement';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import CaseArchives from './pages/CaseArchives';
import AdminDashboard from './pages/AdminDashboard';
import AdminAvocats from './pages/AdminAvocats';
import AdminLayout from './pages/AdminLayout';
import AdminSecretaires from './pages/AdminSecretaires';
import Messages from './pages/AdminMessage';



function ProtectedRoute({ children, token }) {
  if (!token) {
    console.log('No token found, redirecting to login');
    return <Navigate to="/login" />;
  }
  return children;
}

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  const handleSetToken = (newToken) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
  };

  return (
    <Router>
      <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            />


      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login setToken={handleSetToken} />} />
        <Route path="/register" element={<Register setToken={handleSetToken} />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />


      {/*-------------- admin layout ------------------*/}

      <Route element={<AdminLayout />} />



        <Route
          path="/dashboard"
          element={
            <ProtectedRoute token={token}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute token={token}>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/legal-case-management"
          element={
            <ProtectedRoute token={token}>
              <LegalCaseManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/client-management"
          element={
            <ProtectedRoute token={token}>
              <ClientManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/calendar"
          element={
            <ProtectedRoute token={token}>
              <AttorneyCalendar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/appointment/:mode"
          element={
            <ProtectedRoute token={token}>
              <AppointmentForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment-management"
          element={
            <ProtectedRoute token={token}>
              <PaymentManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sessions"
          element={
            <ProtectedRoute token={token}>
              <SessionManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/secretary-management"
          element={
            <ProtectedRoute token={token}>
              <SecretaryManagement />
            </ProtectedRoute>
          }
        />
        {/* <Route
          path="/settings"
          element={
            <ProtectedRoute token={token}>
              <Settings />
            </ProtectedRoute>
          }
        /> */}
        <Route
          path="/case-archives"
          element={
            <ProtectedRoute token={token}>
              <CaseArchives />
            </ProtectedRoute>
          }
        />
{/* -----------admin--------------- */}

        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute token={token}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-avocats"
          element={
            <ProtectedRoute token={token}>
              <AdminAvocats />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-messages"
          element={
            <ProtectedRoute token={token}>
              <Messages />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-secretaires"
          element={
            <ProtectedRoute token={token}>
              <AdminSecretaires />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute token={token}>
              <Settings />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
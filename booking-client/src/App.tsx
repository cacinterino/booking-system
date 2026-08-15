import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './shared/context/AuthContext';
import { ProtectedRoute, PublicRoute } from './shared/components/ProtectedRoute';
import { DashboardLayout } from './shared/components/Navbar';
import { queryClient } from './shared/api/queryClient';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './features/auth/pages/LoginPage';
import { RegisterPage } from './features/auth/pages/RegisterPage';
import { ProfilePage } from './features/auth/pages/ProfilePage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminServicesPage } from './features/services/AdminServicesPage';
import { StaffDashboardPage } from './features/staff/StaffDashboardPage';
import { AdminStaffPage } from './features/staff/AdminStaffPage';
import { BookingWizardPage } from './features/booking/BookingWizardPage';
import { MyBookingsPage } from './features/booking/MyBookingsPage';
import './style.css';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route element={<PublicRoute />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* Guest booking wizard — fully anonymous */}
            <Route path="/book/:businessSlug" element={<BookingWizardPage />} />

            {/* Customer self-service — access code or signed-in customer */}
            <Route path="/my-bookings" element={<MyBookingsPage />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/admin/services" element={<AdminServicesPage />} />
                <Route path="/admin/staff" element={<AdminStaffPage />} />
                <Route path="/staff/calendar" element={<StaffDashboardPage />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
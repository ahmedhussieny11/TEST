import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { usePatientAuthStore } from './patient/store/patientAuthStore';
import Layout from './components/Layout/Layout';
import Login from './pages/Auth/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Appointments from './pages/Appointments/Appointments';
import Patients from './pages/Patients/Patients';
import PatientDetails from './pages/Patients/PatientDetails';
import NewPatient from './pages/Patients/NewPatient';
import ClinicalVisit from './pages/ClinicalVisit/ClinicalVisit';
import Prescriptions from './pages/Prescriptions/Prescriptions';
import LabTests from './pages/LabTests/LabTests';
import Invoices from './pages/Invoices/Invoices';
import Settings from './pages/Settings/Settings';
import Users from './pages/Users/Users';
import Expenses from './pages/Expenses/Expenses';
import Reports from './pages/Reports/Reports';
import LandingPage from './patient/LandingPage';
import BookingWizard from './patient/Booking/BookingWizard';
import PatientLogin from './patient/Auth/Login';
import PatientRegister from './patient/Auth/Register';
import PatientOtp from './patient/Auth/Otp';
import PatientDashboard from './patient/Dashboard/PatientDashboard';
import MyRecords from './patient/Records/MyRecords';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function AppLayout() {
  return (
    <PrivateRoute>
      <Layout>
        <Outlet />
      </Layout>
    </PrivateRoute>
  );
}

function PatientRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = usePatientAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/patient/login" />;
}

function App() {
  return (
    <Routes>
      {/* موقع المريضة */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/book" element={<BookingWizard />} />
      <Route path="/patient/login" element={<PatientLogin />} />
      <Route path="/patient/register" element={<PatientRegister />} />
      <Route path="/patient/otp" element={<PatientOtp />} />
      <Route
        path="/patient/dashboard"
        element={
          <PatientRoute>
            <PatientDashboard />
          </PatientRoute>
        }
      />
      <Route
        path="/patient/records"
        element={
          <PatientRoute>
            <MyRecords />
          </PatientRoute>
        }
      />

      {/* لوحة التحكم (الموظفين) */}
      <Route path="/login" element={<Login />} />
      <Route path="/app" element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="patients" element={<Patients />} />
        <Route path="patients/new" element={<NewPatient />} />
        <Route path="patients/:id" element={<PatientDetails />} />
        <Route path="visit/:appointmentId" element={<ClinicalVisit />} />
        <Route path="prescriptions" element={<Prescriptions />} />
        <Route path="lab-tests" element={<LabTests />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
        <Route path="users" element={<Users />} />
        <Route path="*" element={<Navigate to="/app" replace />} />
      </Route>
    </Routes>
  );
}

export default App;


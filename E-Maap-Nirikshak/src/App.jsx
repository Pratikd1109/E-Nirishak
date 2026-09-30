import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAppStore from './store/useAppStore.js';
import NiriksakChatbot from './components/shared/NiriksakChatbot.jsx';

// Layout
import AppLayout from './components/layout/AppLayout.jsx';

// Auth
import Login from './pages/Login.jsx';

// Owner
import OwnerDashboard from './pages/owner/OwnerDashboard.jsx';
import MyInstruments from './pages/owner/MyInstruments.jsx';
import RegisterInstrument from './pages/owner/RegisterInstrument.jsx';
import InstrumentPassport from './pages/owner/InstrumentPassport.jsx';
import Applications from './pages/owner/Applications.jsx';
import ApplyVerification from './pages/owner/ApplyVerification.jsx';
import Certificates from './pages/owner/Certificates.jsx';
import Notifications from './pages/owner/Notifications.jsx';

// LMO
import LMODashboard from './pages/lmo/LMODashboard.jsx';
import Assignments from './pages/lmo/Assignments.jsx';
import ConductInspection from './pages/lmo/ConductInspection.jsx';
import InspectionHistory from './pages/lmo/InspectionHistory.jsx';

// GATC
import GATCDashboard from './pages/gatc/GATCDashboard.jsx';
import GATCAssignments from './pages/gatc/GATCAssignments.jsx';
import GATCHistory from './pages/gatc/GATCHistory.jsx';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import ApplicationsQueue from './pages/admin/ApplicationsQueue.jsx';
import Stakeholders from './pages/admin/Stakeholders.jsx';
import CertificateRegistry from './pages/admin/CertificateRegistry.jsx';
import Enforcement from './pages/admin/Enforcement.jsx';
import Reports from './pages/admin/Reports.jsx';

// Public
import PublicVerify from './pages/public/PublicVerify.jsx';

// Route guard
function RequireAuth({ children, role }) {
  const { currentRole } = useAppStore();
  if (!currentRole) return <Navigate to="/" replace />;
  if (role && currentRole !== role) return <Navigate to={`/${currentRole}/dashboard`} replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login */}
        <Route path="/" element={<Login />} />

        {/* Public Verification — no auth needed */}
        <Route path="/verify" element={<PublicVerify />} />
        <Route path="/verify/:certificateId" element={<PublicVerify />} />

        {/* Owner */}
        <Route path="/owner" element={<RequireAuth role="owner"><AppLayout role="owner" /></RequireAuth>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<OwnerDashboard />} />
          <Route path="instruments" element={<MyInstruments />} />
          <Route path="instruments/register" element={<RegisterInstrument />} />
          <Route path="instruments/:instrumentId" element={<InstrumentPassport />} />
          <Route path="applications" element={<Applications />} />
          <Route path="applications/apply" element={<ApplyVerification />} />
          <Route path="certificates" element={<Certificates />} />
          <Route path="notifications" element={<Notifications />} />
        </Route>

        {/* LMO */}
        <Route path="/lmo" element={<RequireAuth role="lmo"><AppLayout role="lmo" /></RequireAuth>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<LMODashboard />} />
          <Route path="assignments" element={<Assignments />} />
          <Route path="inspect/:applicationId" element={<ConductInspection />} />
          <Route path="history" element={<InspectionHistory />} />
        </Route>

        {/* GATC */}
        <Route path="/gatc" element={<RequireAuth role="gatc"><AppLayout role="gatc" /></RequireAuth>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<GATCDashboard />} />
          <Route path="assignments" element={<GATCAssignments />} />
          <Route path="inspect/:applicationId" element={<ConductInspection />} />
          <Route path="history" element={<GATCHistory />} />
        </Route>

        {/* Admin */}
        <Route path="/admin" element={<RequireAuth role="admin"><AppLayout role="admin" /></RequireAuth>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="applications" element={<ApplicationsQueue />} />
          <Route path="stakeholders" element={<Stakeholders />} />
          <Route path="certificates" element={<CertificateRegistry />} />
          <Route path="enforcement" element={<Enforcement />} />
          <Route path="reports" element={<Reports />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Niriksak AI — floating chatbot on every page */}
      <NiriksakChatbot />
    </BrowserRouter>
  );
}

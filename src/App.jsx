import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import WelcomePage from "./pages/WelcomePage";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SuperAdminDashboard from "./pages/Superadmin/SuperAdminDashboard";
import CommercialAdminDashboard from "./pages/CommercialAdmin/CommercialAdminDashboard";
import  ResidentDashboard  from "./pages/Resident/ResidentDashboard.jsx";
import ProtectedRoute from "./components/ProtectedRoute";
import PayBill from "./pages/PayBill";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/home" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/resident/pay/:billId" element={<PayBill />} />

        <Route
          path="/super-admin/dashboard"
          element={
            <ProtectedRoute allowedRole="SUPER_ADMIN">
              <SuperAdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/commercial/dashboard"
          element={
            <ProtectedRoute allowedRole="COMMERCIAL_ADMIN">
              <CommercialAdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/resident/dashboard"
          element={
            <ProtectedRoute allowedRole="RESIDENT">
              <ResidentDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
